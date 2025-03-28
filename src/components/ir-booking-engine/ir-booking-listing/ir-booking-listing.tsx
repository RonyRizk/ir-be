import { pages } from '@/components';
import Token from '@/models/Token';
import { CommonService } from '@/services/api/common.service';
import { PropertyService } from '@/services/api/property.service';
import app_store from '@/stores/app.store';
import { checkout_store } from '@/stores/checkout.store';
import localizedWords from '@/stores/localization.store';
import { checkAffiliate, getUserPreference } from '@/utils/utils';
import { Component, Fragment, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import axios from 'axios';

@Component({
  tag: 'ir-booking-listing',
  styleUrl: 'ir-booking-listing.css',
  scoped: false,
})
export class IrBookingListing {
  @Prop() propertyid: number;
  @Prop() baseUrl: string = 'https://gateway.igloorooms.com/IRBE';
  @Prop() language: string;
  @Prop() headerShown: boolean = true;
  @Prop() footerShown: boolean = true;
  @Prop() maxPages: number = 10;
  @Prop() perma_link: string = null;
  @Prop() aName: string = null;
  @Prop() showAllBookings: boolean = true;
  @Prop() be: boolean = false;
  @Prop() startScreen: { screen: 'bookings' | 'booking-details'; params: unknown } = { screen: 'bookings', params: null };
  @Prop() aff: string = null;
  @Prop() version: string = '2.0';
  @Prop() hideGoogleSignIn: boolean = true;

  @State() isLoading = false;
  @State() bookingNumber = null;
  @State() currentPage: 'bookings' | 'booking-details' | 'user-profile' = 'bookings';
  @State() selectedBooking: { email: string; booking_nbr: string } | null = null;
  @State() isAffiliate: boolean = false;
  @State() isSignedIn: boolean = false;

  private commonService = new CommonService();
  private propertyService = new PropertyService();
  private token = new Token();

  private privacyPolicyRef: HTMLIrPrivacyPolicyElement;

  async componentWillLoad() {
    axios.defaults.baseURL = this.baseUrl;
    app_store.app_data.hideGoogleSignIn = this.hideGoogleSignIn;
    this.currentPage = this.startScreen.screen;
    this.selectedBooking = (this.startScreen.params as any) ?? null;
    getUserPreference(this.language);
    const isAuthenticated = this.commonService.checkUserAuthState();
    if (isAuthenticated) {
      this.bookingNumber = isAuthenticated.params ? isAuthenticated.params.booking_nbr : null;
      this.token.setToken(isAuthenticated.token);
      this.isSignedIn = true;
    } else {
      const token = await this.commonService.getBEToken();
      if (token) {
        this.token.setToken(token);
      }
    }
    if (!this.be) {
      this.initializeApp();
    }
  }

  @Watch('aff')
  handleAffiliateChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.isAffiliate = checkAffiliate(this.aff.toLowerCase().trim()) !== null;
    }
  }

  @Listen('screenChanged', { target: 'body' })
  handleScreenChanged(e: CustomEvent<pages>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const screen = e.detail;
    if (!['booking-listing', 'user-profile'].includes(screen) || (this.currentPage === 'bookings' && screen === 'booking-listing')) {
      return;
    }
    this.currentPage = screen === 'booking-listing' ? 'bookings' : 'user-profile';
  }
  private async fetchGuest() {
    try {
      this.isLoading = true;
      await this.propertyService.getExposedGuest();
    } catch (error) {
    } finally {
      this.isLoading = false;
    }
  }

  async initializeApp() {
    try {
      this.isLoading = true;
      let requests: any = [];
      app_store.app_data.aName = this.aName;
      app_store.app_data.perma_link = this.perma_link;
      app_store.app_data.property_id = this.propertyid;
      if (!this.be) {
        requests = [
          ...requests,
          this.commonService.getExposedLanguage(),
          this.commonService.getCurrencies(),
          this.propertyService.getExposedProperty({
            id: this.propertyid,
            language: app_store.userPreferences?.language_id || this.language || 'en',
            aname: this.aName,
            perma_link: this.perma_link,
          }),
        ];
      }
      if (this.isSignedIn) {
        requests = [...requests, this.propertyService.getExposedGuest()];
      }
      await Promise.all(requests);
      this.isAffiliate = checkAffiliate(this.aff?.toLowerCase().trim()) !== null;
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }

  @Listen('authFinish')
  handleAuthFinish(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (this.be) {
      return;
    }
    const { token, state, payload } = e.detail;
    if (state === 'success') {
      if (payload.method === 'direct') {
        this.selectedBooking = { email: payload.email, booking_nbr: payload.booking_nbr };
        this.bookingNumber = payload.booking_nbr;
        this.currentPage = 'booking-details';
      }
      this.token.setToken(token);
      this.isSignedIn = true;
      this.fetchGuest();
    }
  }
  @Listen('signOut')
  handleSignout() {
    if (this.be) {
      return;
    }
    this.token.setToken('');
    this.isSignedIn = false;
  }

  @Listen('bl_routing')
  handleRouting(e: CustomEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const { params, route } = e.detail;
    this.currentPage = route;
    this.selectedBooking = params.booking ? { email: params?.booking.guest.email, booking_nbr: params.booking.booking_nbr } : null;
  }
  @Listen('openPrivacyPolicy')
  async openPrivacyPolicy(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (this.privacyPolicyRef) {
      this.privacyPolicyRef.openModal();
    }
  }
  private renderPages() {
    switch (this.currentPage) {
      case 'bookings':
        return (
          <ir-booking-overview
            aff={this.isAffiliate}
            propertyid={app_store.app_data.property_id}
            language={this.language}
            maxPages={this.maxPages}
            showAllBookings={this.showAllBookings}
            be={this.be}
          ></ir-booking-overview>
        );
      case 'booking-details':
        return (
          <div class={this.be ? '' : 'mx-auto px-4 lg:px-6'}>
            <div class="header-left">
              <ir-button
                variants="icon"
                onButtonClick={e => {
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  this.currentPage = 'bookings';
                  this.selectedBooking = null;
                  // this.bl_routing.emit({ route: 'booking' });
                }}
                iconName={app_store.dir === 'RTL' ? 'angle_right' : ('angle_left' as any)}
              ></ir-button>
              <p class="header-title">{localizedWords.entries.Lcz_MyBookings}</p>
            </div>
            <ir-invoice
              locationShown={false}
              headerShown={false}
              headerMessageShown={false}
              footerShown={false}
              propertyId={app_store.app_data.property_id}
              perma_link={this.perma_link}
              aName={this.aName}
              isConfermation={false}
              language={this.language}
              baseUrl={this.baseUrl}
              email={this.selectedBooking.email}
              bookingNbr={this.selectedBooking.booking_nbr}
              status={1}
              be={true}
            ></ir-invoice>
          </div>
        );
      case 'user-profile':
        if (this.be) {
          return;
        }
        return (
          <ir-user-profile
            be={this.be}
            user_data={{
              id: checkout_store.userFormData.id,
              email: checkout_store.userFormData.email,
              first_name: checkout_store.userFormData.firstName,
              last_name: checkout_store.userFormData.lastName,
              country_id: checkout_store.userFormData.country_id,
              mobile: checkout_store.userFormData.mobile_number,
              country_phone_prefix: checkout_store.userFormData.country_phone_prefix.toString(),
            }}
          ></ir-user-profile>
        );
      default:
        return (
          <ir-booking-overview
            aff={this.isAffiliate}
            propertyid={app_store.app_data.property_id}
            language={this.language}
            maxPages={this.maxPages}
            showAllBookings={this.showAllBookings}
            be={this.be}
          ></ir-booking-overview>
        );
    }
  }
  private renderAuthScreen() {
    if (this.isLoading) {
      return (
        <main class="flex min-h-screen flex-col">
          <div class="flex h-14 p-4">
            <ir-skeleton class=" mx-auto h-10 w-80 "></ir-skeleton>
          </div>
          <div class="mx-auto flex h-full w-full max-w-md flex-1 flex-col gap-4 px-4 py-4 ">
            <ir-skeleton class="mb-2 h-6 w-56 self-center"></ir-skeleton>
            <ir-skeleton class="h-12 w-full"></ir-skeleton>
            <ir-skeleton class="h-12 w-full"></ir-skeleton>
            <ir-skeleton class="h-10 w-full rounded-full"></ir-skeleton>
          </div>
        </main>
      );
    }

    return (
      <main class="flex min-h-screen flex-col">
        <nav class="ir-auth-nav">
          <div class="ir-auth-nav-container relative">
            <div class={'flex w-full items-center gap-4'}>
              <ir-button
                class={'bl-back-btn absolute'}
                variants="icon"
                iconName="angle_left"
                onButtonClick={() => (window.location.href = `https://${app_store.property.perma_link}.bookingmystay.com`)}
              ></ir-button>
              <div class={'flex w-full flex-1 justify-center '}>
                <a
                  aria-label="home"
                  target="_blank"
                  href={`https://${app_store.app_data.affiliate ? app_store.app_data.affiliate.sites[0]?.url : app_store.property?.space_theme.website}`}
                >
                  <img
                    loading="lazy"
                    src={app_store.app_data?.affiliate ? app_store.app_data?.affiliate.sites[0]?.logo : app_store.property?.space_theme?.logo}
                    alt={`${app_store.property?.name}, ${app_store.property?.country.name}`}
                    class="ir-nav-logo aspect-1"
                  ></img>
                </a>
              </div>
            </div>
          </div>
        </nav>
        <div class="mx-auto flex h-full  w-full max-w-md flex-1 flex-col px-4 py-4 ">
          <ir-auth enableSignUp={false}></ir-auth>
        </div>
      </main>
    );
  }
  private renderBookingsScreen() {
    if (this.isLoading) {
      return (
        <div class="grid h-screen w-full place-content-center">
          {!this.be && <ir-interceptor></ir-interceptor>}
          <div class=" flex h-screen flex-col gap-4 md:hidden">
            {[...Array(5)].map(p => (
              <div key={p} class="block h-64 w-full animate-pulse rounded-md bg-gray-200"></div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <Fragment>
        {this.headerShown && (
          <ir-nav
            isBookingListing
            showBookingCode={false}
            showCurrency={false}
            website={app_store.property?.space_theme.website}
            logo={app_store.property?.space_theme?.logo}
          ></ir-nav>
        )}
        <div class={`mx-auto max-w-6xl `}>{this.renderPages()}</div>
        {this.footerShown && <ir-footer version={this.version}></ir-footer>}
        {this.footerShown && <ir-privacy-policy hideTrigger ref={el => (this.privacyPolicyRef = el)}></ir-privacy-policy>}
      </Fragment>
    );
  }
  render() {
    return (
      <Host>
        {!this.be && <ir-interceptor></ir-interceptor>}
        {!this.isSignedIn ? this.renderAuthScreen() : this.renderBookingsScreen()}
      </Host>
    );
  }
}
