import { pages } from '@/components';
import { CommonService } from '@/services/api/common.service';
import { PropertyService } from '@/services/api/property.service';
import app_store from '@/stores/app.store';
import { checkout_store } from '@/stores/checkout.store';
import { checkAffiliate, getUserPrefernce } from '@/utils/utils';
import { Component, Fragment, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import axios from 'axios';

@Component({
  tag: 'ir-booking-listing',
  styleUrl: 'ir-booking-listing.css',
  scoped: false,
})
export class IrBookingListing {
  @Prop() propertyid: number;
  @Prop() baseUrl: string;
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
  @State() token: string;
  @State() bookingNumber = null;
  @State() currentPage: 'bookings' | 'booking-details' | 'user-profile' = 'bookings';
  @State() selectedBooking: { email: string; booking_nbr: string } | null = null;
  @State() isAffiliate: boolean = false;

  private commonService = new CommonService();
  private propertyService = new PropertyService();

  async componentWillLoad() {
    axios.defaults.baseURL = this.baseUrl;
    app_store.app_data.hideGoogleSignIn = this.hideGoogleSignIn;
    if (!this.propertyid) {
      throw new Error('missing property id');
    }
    this.currentPage = this.startScreen.screen;
    this.selectedBooking = (this.startScreen.params as any) ?? null;
    getUserPrefernce();
    const isAuthenticated = this.commonService.checkUserAuthState();
    if (isAuthenticated) {
      this.bookingNumber = isAuthenticated.params ? isAuthenticated.params.booking_nbr : null;
      this.token = isAuthenticated.token;
      app_store.app_data.token = this.token;
    } else {
      const token = await this.commonService.getBEToken();
      if (token) {
        app_store.app_data.token = token;
      }
    }
    this.initializeServices();
    this.initializeApp();
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

  async initializeApp() {
    try {
      this.isLoading = true;
      let requests: any = [this.propertyService.getExposedGuest()];
      if (!this.be) {
        requests = [
          ...requests,
          this.commonService.getExposedLanguage(),
          this.propertyService.getExposedProperty({
            id: this.propertyid,
            language: app_store.userPreferences?.language_id || 'en',
            aname: this.aName,
            perma_link: this.perma_link,
          }),
        ];
      }
      await Promise.all(requests);
      this.isAffiliate = checkAffiliate(this.aff?.toLowerCase().trim()) !== null;
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }
  initializeServices() {
    this.propertyService.setToken(this.token);
    this.commonService.setToken(this.token);
  }
  @Listen('authFinish')
  handleAuthFinish(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { token, state, payload } = e.detail;
    if (state === 'success') {
      if (payload.method === 'direct') {
        this.selectedBooking = { email: payload.email, booking_nbr: payload.booking_nbr };
        this.bookingNumber = payload.booking_nbr;
        this.currentPage = 'booking-details';
      }
      this.token = token;
      this.initializeServices();
      this.initializeApp();
    }
  }
  @Listen('signOut')
  handleSignout() {
    if (this.be) {
      return;
    }
    this.token = null;
  }

  @Listen('bl_routing')
  handleRouting(e: CustomEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const { params, route } = e.detail;
    this.currentPage = route;
    this.selectedBooking = params.booking ? { email: params?.booking.guest.email, booking_nbr: params.booking.booking_nbr } : null;
  }

  private renderPages() {
    switch (this.currentPage) {
      case 'bookings':
        return (
          <ir-booking-overview
            aff={this.isAffiliate}
            token={this.token}
            propertyid={this.propertyid}
            language={this.language}
            maxPages={this.maxPages}
            showAllBookings={this.showAllBookings}
            be={this.be}
          ></ir-booking-overview>
        );
      case 'booking-details':
        return (
          <div>
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
              <p class="header-title">My bookings</p>
            </div>
            <ir-invoice
              locationShown={false}
              headerShown={false}
              footerShown={false}
              propertyId={this.propertyid}
              perma_link={this.perma_link}
              aName={this.aName}
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
            token={this.token}
            propertyid={this.propertyid}
            language={this.language}
            maxPages={this.maxPages}
            showAllBookings={this.showAllBookings}
            be={this.be}
          ></ir-booking-overview>
        );
    }
  }
  private renderAuthScreen() {
    return (
      <main class="flex h-screen flex-col  justify-center">
        <div class="mx-auto w-full max-w-md px-4">
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
      </Fragment>
    );
  }
  render() {
    return (
      <Host>
        {!this.be && <ir-interceptor></ir-interceptor>}
        {!this.token ? this.renderAuthScreen() : this.renderBookingsScreen()}
      </Host>
    );
  }
}
