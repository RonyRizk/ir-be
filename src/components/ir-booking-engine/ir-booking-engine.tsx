import { CommonService } from '@/services/api/common.service';
import { PropertyService } from '@/services/api/property.service';
import { Component, Listen, Prop, State, Watch, h } from '@stencil/core';
import { format, Locale } from 'date-fns';
import { ICurrency, IExposedLanguages } from '@/models/common';
import axios from 'axios';
import { Variation } from '@/models/property';
import booking_store, { updateRoomParams } from '@/stores/booking';
import app_store, { changeLocale, updateUserPreference } from '@/stores/app.store';
import { getUserPrefernce, matchLocale, setDefaultLocale } from '@/utils/utils';
import Stack from '@/models/stack';
import { v4 } from 'uuid';
import { AvailabiltyService } from '@/services/app/availability.service';

@Component({
  tag: 'ir-booking-engine',
  styleUrl: 'ir-booking-engine.css',
  scoped: true,
})
export class IrBookingEngine {
  @Prop({ mutable: true }) token: string =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3MTQ1NTQ5OTIsIkNMQUlNLTAxIjoiOGJpaUdjK21FQVE9IiwiQ0xBSU0tMDIiOiI5UStMQm93VTl6az0iLCJDTEFJTS0wMyI6Ilp3Tys5azJoTzUwPSIsIkNMQUlNLTA0IjoicUxHWllZcVA3SzB5aENrRTFaY0tENm5TeFowNkEvQ2lPc1JrWUpYTHFhTEF5M3N0akltbU9CWkdDb080dDRyNVRiWjkxYnZQelFIQ2c1YlBGU2J3cm5HdjNsNjVVcjVLT3RnMmZQVWFnNHNEYmE3WTJkMDF4RGpDWUs2SFlGREhkcTFYTzBLdTVtd0NKeU5rWDFSeWZmSnhJdWdtZFBUeTZPWjk0RUVjYTJleWVSVzZFa0pYMnhCZzFNdnJ3aFRKRHF1cUxzaUxvZ3I0UFU5Y2x0MjdnQ2tJZlJzZ2lZbnpOK2szclZnTUdsQTUvWjRHekJWcHl3a0dqcWlpa0M5T0owWFUrdWJJM1dzNmNvSWEwSks4SWRqVjVaQ1VaZjZ1OGhBMytCUlpsUWlyWmFZVWZlVmpzU1FETFNwWFowYjVQY0FncE1EWVpmRGtWbGFscjRzZ1pRNVkwODkwcEp6dE16T0s2VTR5Z1FMQkdQbTlTSmRLY0ExSGU2MXl2YlhuIiwiQ0xBSU0tMDUiOiJFQTEzejA3ejBUcWRkM2gwNElyYThBcklIUzg2aEpCQSJ9.ySJjLhWwUDeP4X8LIJcbsjO74y_UgMHwRDpNrCClndc';
  @Prop() propertyId: number;
  @Prop() baseUrl: string;
  @Prop() injected: boolean;
  @Prop() roomtype_id: number = null;
  @Prop() redirect_url: string = null;

  //extra props
  @Prop() perma_link: string = null;
  @Prop() aName: string = null;
  @Prop() fromDate: string;
  @Prop() language: string;
  @Prop() toDate: string;
  @Prop() adultCount: string;
  @Prop() childrenCount: string;
  @Prop() cur: string;
  @Prop() aff: string;
  @Prop() stag: string | null;
  @Prop() source: {
    code: string;
    desciption: string;
  } | null = null;

  @State() selectedLocale: Locale;
  @State() currencies: ICurrency[];
  @State() languages: IExposedLanguages[];
  @State() isLoading: boolean = false;

  private commonService = new CommonService();
  private propertyService = new PropertyService();
  private availabiltyService = new AvailabiltyService();
  private identifier: string;

  @State() router = new Stack<HTMLElement>();

  async componentWillLoad() {
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = this.baseUrl;
    getUserPrefernce(this.language);

    const isAuthenticated = this.commonService.checkUserAuthState();
    if (isAuthenticated) {
      app_store.is_signed_in = true;
      this.token = isAuthenticated.token;
      app_store.app_data.token = this.token;
    } else {
      this.token = await this.commonService.getBEToken();
    }
  }
  @Watch('token')
  handleTokenChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.initializeApp();
    }
  }

  // @Watch('language')
  // handleLanguageChange(newValue: string, oldValue: string) {
  //   if (!this.languages) {
  //     return;
  //   }
  //   if (newValue !== oldValue) {
  //     this.modifyLanguage(newValue);
  //   }
  // }
  modifyLanguage(code: string) {
    if (!this.languages) {
      return;
    }
    changeLocale(this.languages.find(l => l.code.toLowerCase() === code)?.direction || 'LTR', matchLocale(code));
    updateUserPreference({
      language_id: code,
    });
  }
  @Watch('cur')
  handleCurrencyChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      updateUserPreference({
        currency_id: newValue,
      });
    }
  }

  initializeApp() {
    this.commonService.setToken(this.token);
    this.propertyService.setToken(this.token);
    app_store.app_data = {
      token: this.token,
      property_id: this.propertyId,
      injected: this.injected,
      roomtype_id: this.roomtype_id,
      redirect_url: this.redirect_url,
      affiliate: null,
      tag: this.stag,
      source: this.source,
    };
    this.initRequest();
  }
  async initRequest() {
    this.isLoading = true;
    const p = JSON.parse(localStorage.getItem('user_preference'));
    let requests = [
      this.propertyService.getExposedProperty({ id: this.propertyId, language: app_store.userPreferences?.language_id || 'en', aname: this.aName, perma_link: this.perma_link }),
      this.commonService.getCurrencies(),
      this.commonService.getExposedLanguages(),
      this.commonService.getExposedCountryByIp(),
      this.commonService.getExposedLanguage(),
      // ,
    ];
    if (app_store.is_signed_in) {
      requests.push(this.propertyService.getExposedGuest());
    }
    const [_, currencies, languages] = await Promise.all(requests);
    this.currencies = currencies;
    this.languages = languages;

    if (!p) {
      if (this.language) {
        this.modifyLanguage(this.language);
      }
      setDefaultLocale({ currency: app_store.userDefaultCountry.currency });
    }
    app_store.app_data = {
      ...app_store.app_data,
      affiliate: this.checkAffiliate(),
    };

    // booking_store.roomTypes = [...roomtypes];
    this.isLoading = false;
  }
  checkAffiliate() {
    if (this.aff) {
      const affiliate = app_store?.property?.affiliates.find(aff => aff.afname.toLowerCase().trim() === this.aff.toLowerCase().trim());
      if (!affiliate) {
        return null;
      }
      return affiliate;
    }
    return null;
  }
  handleVariationChange(e: CustomEvent, variations: Variation[], rateplanId: number, roomTypeId: number) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const value = e.detail;
    const selectedVariation = variations.find(variation => variation.adult_child_offering === value);
    if (!selectedVariation) {
      return;
    }
    updateRoomParams({ params: { selected_variation: { variation: selectedVariation, state: 'modified' } }, ratePlanId: rateplanId, roomTypeId });
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
  async resetBooking(resetType: 'discountOnly' | 'completeReset' = 'completeReset') {
    let queries = [];
    if (resetType === 'discountOnly' && app_store.fetchedBooking) {
      queries.push(this.checkAvailability());
    } else if (resetType === 'completeReset') {
      queries = [
        ...queries,
        ...[
          this.commonService.getExposedLanguage(),
          this.propertyService.getExposedProperty(
            { id: app_store.app_data.property_id, language: app_store.userPreferences?.language_id || 'en', aname: this.aName, perma_link: this.perma_link },
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
  async checkAvailability() {
    this.identifier = v4();
    this.availabiltyService.initSocket(this.identifier);
    await this.propertyService.getExposedBookingAvailability({
      params: {
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
        agent_id: booking_store.bookingAvailabilityParams.agent || 0,
      },
      identifier: this.identifier,
      mode: 'default',
    });
  }
  renderScreens() {
    switch (app_store.currentPage) {
      case 'booking':
        return <ir-booking-page adultCount={this.adultCount} childrenCount={this.childrenCount} fromDate={this.fromDate} toDate={this.toDate}></ir-booking-page>;
      case 'checkout':
        return <ir-checkout-page></ir-checkout-page>;
      case 'invoice':
        return (
          <ir-invoice
            headerShown={false}
            footerShown={false}
            propertyId={this.propertyId}
            perma_link={this.perma_link}
            aName={this.aName}
            language={this.language}
            baseUrl={this.baseUrl}
            email={app_store.invoice.email}
            bookingNbr={app_store.invoice.booking_number}
            status={1}
          ></ir-invoice>
        );
      case 'booking-listing':
        return (
          <ir-booking-listing
            showAllBookings={false}
            headerShown={false}
            footerShown={false}
            propertyid={this.propertyId}
            perma_link={this.perma_link}
            aName={this.aName}
            be={true}
            baseUrl={this.baseUrl}
          ></ir-booking-listing>
        );

      default:
        return null;
    }
  }
  disconnectedCallback() {
    this.availabiltyService.disconnectSocket();
  }
  render() {
    if (this.isLoading) {
      return null;
    }
    return (
      <main class="relative  flex w-full flex-col space-y-5 ">
        <ir-interceptor></ir-interceptor>
        <section class="sticky top-0 z-50 m-0 w-full p-0 ">
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
        {!this.injected && <ir-footer></ir-footer>}
      </main>
    );
  }
}
