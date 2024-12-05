import { CommonService } from '@/services/api/common.service';
import { PropertyService } from '@/services/api/property.service';
import { Component, Listen, Prop, State, Watch, h } from '@stencil/core';
import { addYears, format, Locale } from 'date-fns';
import { IExposedProperty } from '@/models/property';
import booking_store, { modifyBookingStore } from '@/stores/booking';
import app_store, { changeLocale, TSource, updateUserPreference } from '@/stores/app.store';
import { checkAffiliate, checkGhs, getUserPreference, matchLocale, setDefaultLocale, validateAgentCode, validateCoupon } from '@/utils/utils';
import Stack from '@/models/stack';
import { checkout_store } from '@/stores/checkout.store';
import Token from '@/models/Token';
import { ICurrency, IExposedLanguages } from '@/models/common';

@Component({
  tag: 'ir-be',
  styleUrl: 'ir-booking-engine.css',
  shadow: true,
})
export class IrBookingEngine {
  @Prop() propertyId: number;
  @Prop() injected: boolean;
  @Prop() rt_id: number = null;
  @Prop() rp_id: number = null;

  //extra props
  @Prop() perma_link: string = null;
  @Prop() p: string = null;
  @Prop() checkin: string;
  @Prop() checkout: string;
  @Prop() language: string;
  @Prop() adults: string = '2';
  @Prop() child: string;
  @Prop() ages: string;
  @Prop() cur: string;
  @Prop() aff: string;
  @Prop() stag: string | null;
  @Prop() property: IExposedProperty | null = null;
  @Prop() source: TSource | null = null;
  @Prop() hideGoogleSignIn: boolean = true;
  @Prop() origin: string | null = null;

  //discount properties
  @Prop() coupon: string;
  @Prop() loyalty: boolean;
  @Prop() agent_code: string;

  @State() selectedLocale: Locale;
  @State() currencies: ICurrency[];
  @State() languages: IExposedLanguages[];
  @State() isLoading: boolean = false;
  @State() router = new Stack<HTMLElement>();
  @State() bookingListingScreenOptions: { screen: 'bookings' | 'booking-details'; params: unknown } = { params: null, screen: 'bookings' };

  private version: string = '2.47';
  private baseUrl: string = 'https://gateway.igloorooms.com/IRBE';

  private commonService = new CommonService();
  private propertyService = new PropertyService();
  private token = new Token();
  privacyPolicyRef: any;

  async componentWillLoad() {
    console.log(`version:${this.version}`);
    getUserPreference(this.language);
    if (this.property) {
      app_store.property = { ...this.property };
    }
    const isAuthenticated = this.commonService.checkUserAuthState();
    if (isAuthenticated) {
      app_store.is_signed_in = true;
      this.token.setToken(isAuthenticated.token);
    } else {
      const token = await this.commonService.getBEToken();
      this.token.setToken(token);
    }
    this.initializeApp();
  }

  @Watch('source')
  handleSourceChange(newSource: TSource, oldSource: TSource) {
    if (newSource && (!oldSource || oldSource.code !== newSource.code)) {
      this.setSource(newSource);
    }
  }

  @Watch('cur')
  handleCurrencyChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      updateUserPreference({
        currency_id: newValue,
      });
    }
  }
  @Watch('coupon')
  handleCouponChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      validateCoupon(newValue);
    }
  }
  @Watch('loyalty')
  handleLoyaltyChange(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue) {
      this.modifyLoyalty();
    }
  }

  @Watch('agent_code')
  handleAgentCodeChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      validateAgentCode(newValue);
    }
  }

  private setSource(newSource: TSource) {
    app_store.app_data = { ...app_store.app_data, source: newSource };
  }

  private modifyLanguage(code: string) {
    if (!this.languages) {
      return;
    }
    changeLocale(this.languages.find(l => l.code.toLowerCase() === code)?.direction || 'LTR', matchLocale(code));
    updateUserPreference({
      language_id: code,
    });
  }

  private initializeApp() {
    app_store.app_data = {
      aName: this.p,
      origin: this.origin,
      perma_link: this.perma_link,
      displayMode: 'default',
      isFromGhs: checkGhs(this.source?.code, this.stag),
      token: '',
      property_id: this.propertyId,
      injected: this.injected,
      roomtype_id: this.rt_id,
      affiliate: null,
      tag: this.stag,
      source: this.source,
      hideGoogleSignIn: this.hideGoogleSignIn,
      stag: this.stag,
    };
    this.initRequest();
  }

  private async initRequest() {
    this.isLoading = true;
    const p = JSON.parse(localStorage.getItem('user_preference'));
    let requests = [
      this.commonService.getCurrencies(),
      this.commonService.getExposedLanguages(),
      this.commonService.getExposedCountryByIp({
        id: this.propertyId?.toString(),
        perma_link: this.perma_link,
        aname: this.p,
      }),
      this.commonService.getExposedLanguage(),
      this.propertyService.getExposedProperty({ id: this.propertyId, language: app_store.userPreferences?.language_id || 'en', aname: this.p, perma_link: this.perma_link }),
      this.propertyService.getExposedNonBookableNights({
        porperty_id: this.propertyId,
        from_date: format(new Date(), 'yyyy-MM-dd'),
        to_date: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
        perma_link: this.perma_link,
        aname: this.p,
      }),
    ];
    if (app_store.is_signed_in) {
      requests.push(this.propertyService.getExposedGuest());
    }
    const [currencies, languages] = await Promise.all(requests);
    this.currencies = currencies;
    this.languages = languages;
    if (!p) {
      if (this.language) {
        this.modifyLanguage(this.language.toLowerCase());
      }
      let currency = app_store.userDefaultCountry.currency;
      if (this.cur) {
        const newCurr = this.currencies.find(c => c.code.toLowerCase() === this.cur.toLowerCase());
        if (newCurr) {
          currency = newCurr;
        }
      }
      setDefaultLocale({ currency });
    }
    this.checkAndApplyDiscounts();

    app_store.app_data = {
      ...app_store.app_data,
      affiliate: checkAffiliate(this.aff?.toLowerCase().trim()),
    };
    this.isLoading = false;
  }
  private checkAndApplyDiscounts() {
    if (this.coupon) {
      validateCoupon(this.coupon);
    }
    if (this.loyalty) {
      this.modifyLoyalty();
    }
    if (this.agent_code) {
      validateAgentCode(this.agent_code);
    }
  }
  // private handleVariationChange(e: CustomEvent, variations: Variation[], rateplanId: number, roomTypeId: number) {
  //   e.stopImmediatePropagation();
  //   e.stopPropagation();
  //   const value = e.detail;
  //   const selectedVariation = variations.find(variation => variation.adult_child_offering === value);
  //   if (!selectedVariation) {
  //     return;
  //   }
  //   updateRoomParams({ params: { selected_variation: { variation: selectedVariation, state: 'modified' } }, ratePlanId: rateplanId, roomTypeId });
  // }
  private modifyLoyalty() {
    modifyBookingStore('bookingAvailabilityParams', {
      ...booking_store.bookingAvailabilityParams,
      coupon: null,
      loyalty: this.loyalty,
    });
  }

  @Listen('routing')
  handleNavigation(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    app_store.currentPage = e.detail;
  }
  @Listen('resetBooking')
  async handleResetBooking(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    await this.resetBooking(e.detail ?? 'completeReset');
  }
  @Listen('openPrivacyPolicy')
  async openPrivacyPolicy(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.privacyPolicyRef.openModal();
  }
  @Listen('authStatus')
  handleAuthFinish(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { state, payload } = e.detail;
    if (state === 'success') {
      if (payload.method === 'direct') {
        this.bookingListingScreenOptions = {
          screen: 'booking-details',
          params: {
            booking_nbr: payload.booking_nbr,
            email: payload.email,
          },
        };
        app_store.currentPage = 'booking-listing';
      }
    }
  }

  private async resetBooking(resetType: 'partialReset' | 'completeReset' = 'completeReset') {
    let queries = [];
    if (resetType === 'partialReset' && app_store.fetchedBooking) {
      queries.push(this.checkAvailability());
    } else if (resetType === 'completeReset') {
      queries = [
        ...queries,
        ...[
          this.commonService.getExposedLanguage(),
          this.propertyService.getExposedProperty(
            { id: app_store.app_data.property_id, language: app_store.userPreferences?.language_id || 'en', aname: this.p, perma_link: this.perma_link },
            false,
          ),
        ],
      ];
      if (app_store.fetchedBooking) {
        queries.push(this.checkAvailability());
      }
    }
    await Promise.all(queries);
  }

  private async checkAvailability() {
    console.warn('here');
    booking_store.resetBooking = false;
    await this.propertyService.getExposedBookingAvailability({
      propertyid: app_store.app_data.property_id,
      from_date: format(booking_store.bookingAvailabilityParams.from_date, 'yyyy-MM-dd'),
      to_date: format(booking_store.bookingAvailabilityParams.to_date, 'yyyy-MM-dd'),
      room_type_ids: [],
      adult_nbr: booking_store.bookingAvailabilityParams.adult_nbr,
      child_nbr: booking_store.bookingAvailabilityParams.child_nbr,
      language: app_store.userPreferences.language_id,
      currency_ref: app_store.userPreferences.currency_id,
      is_in_loyalty_mode: booking_store.bookingAvailabilityParams.loyalty ? true : !!booking_store.bookingAvailabilityParams.coupon,
      promo_key: booking_store.bookingAvailabilityParams.coupon || '',
      is_in_agent_mode: !!booking_store.bookingAvailabilityParams.agent || false,
      agent_id: booking_store.bookingAvailabilityParams.agent?.id || 0,
      is_in_affiliate_mode: !!app_store.app_data.affiliate,
      affiliate_id: app_store.app_data.affiliate ? app_store.app_data.affiliate.id : null,
    });
  }

  private renderScreens() {
    switch (app_store.currentPage) {
      case 'booking':
        return <ir-booking-page adultCount={this.adults} childrenCount={this.child} ages={this.ages} fromDate={this.checkin} toDate={this.checkout}></ir-booking-page>;
      case 'checkout':
        return <ir-checkout-page></ir-checkout-page>;
      case 'invoice':
        return (
          <ir-invoice
            version={this.version}
            headerShown={false}
            footerShown={false}
            propertyId={this.propertyId}
            perma_link={this.perma_link}
            aName={this.p}
            language={this.language?.toLowerCase()}
            baseUrl={this.baseUrl}
            email={app_store.invoice.email}
            bookingNbr={app_store.invoice.booking_number}
            status={1}
            be={true}
          ></ir-invoice>
        );
      case 'booking-listing':
        return (
          <ir-booking-listing
            version={this.version}
            startScreen={this.bookingListingScreenOptions}
            showAllBookings={false}
            headerShown={false}
            footerShown={false}
            propertyid={app_store.app_data.property_id}
            perma_link={this.perma_link}
            aName={this.p}
            be={true}
            baseUrl={this.baseUrl}
            aff={this.aff}
          ></ir-booking-listing>
        );
      case 'user-profile':
        return (
          <ir-user-profile
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
        return null;
    }
  }

  render() {
    if (this.isLoading) {
      return <ir-home-loader></ir-home-loader>;
    }
    return (
      <main class="relative  flex w-full flex-col space-y-5 ">
        <ir-interceptor></ir-interceptor>
        <section class={`${this.injected ? '' : 'sticky top-0 z-20'}  m-0 w-full p-0 `}>
          <ir-nav
            class={'m-0 p-0'}
            website={app_store.property?.space_theme.website}
            logo={app_store.property?.space_theme?.logo}
            currencies={this.currencies}
            languages={this.languages}
          ></ir-nav>
        </section>
        <section class="flex-1 px-4 lg:px-6">
          <div class="mx-auto max-w-6xl">{this.renderScreens()}</div>
        </section>
        <ir-privacy-policy ref={el => (this.privacyPolicyRef = el)} hideTrigger={true}></ir-privacy-policy>
        {!this.injected && <ir-footer version={this.version}></ir-footer>}
      </main>
    );
  }
}
