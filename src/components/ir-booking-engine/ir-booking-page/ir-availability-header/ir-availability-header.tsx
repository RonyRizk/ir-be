import { Component, Event, EventEmitter, h, Listen, Prop, State, Watch } from '@stencil/core';
import { ExposedBookingAvailability, TExposedBookingAvailability } from './availability';
import { ZodError } from 'zod';
import { onAppDataChange } from '@/stores/app.store';
import { PropertyService } from '@/services/api/property.service';
import app_store from '@/stores/app.store';
import booking_store from '@/stores/booking';
import localizedWords from '@/stores/localization.store';
import { QueryStringValidator } from '@/validators/querystring.validator';
import { calculateInfantNumber, modifyQueryParam, passedBookingCutoff } from '@/utils/utils';
import { AddAdultsAndChildrenEvent } from '../ir-adult-child-counter/ir-adult-child-counter';
import moment from 'moment/min/moment-with-locales';

@Component({
  tag: 'ir-availability-header',
  styleUrl: 'ir-availability-header.css',
  shadow: true,
})
export class IrAvailabilityHeader {
  @Prop() fromDate: string;
  @Prop() toDate: string;
  @Prop() adultCount: string;
  @Prop() childrenCount: string;
  @Prop() ages: string = '';

  @State() target: HTMLElement = null;
  @State() isLoading = false;
  @State() exposedBookingAvailabilityParams: TExposedBookingAvailability = {
    adult_nbr: 2,
    child_nbr: 0,
    currency_ref: 'USD',
    infant_nbr: 0,
    language: 'en',
    room_type_ids: [],
    propertyid: 42,
    is_in_loyalty_mode: booking_store.bookingAvailabilityParams.loyalty ? true : !!booking_store.bookingAvailabilityParams.coupon,
    promo_key: booking_store.bookingAvailabilityParams.coupon || '',
    is_in_agent_mode: !!booking_store.bookingAvailabilityParams.agent || false,
    agent_id: booking_store.bookingAvailabilityParams.agent?.id || 0,
  };

  @Event() resetBooking: EventEmitter<null>;
  @Event() scrollToRoomType: EventEmitter<null>;

  private errorCause: ('date' | 'adult_child')[] | null = null;
  private popoverInstance = null;
  private toast_timeout: NodeJS.Timeout;
  private personCounter: HTMLIrAdultChildCounterElement;

  private propertyService = new PropertyService();
  private validator = new QueryStringValidator();

  componentWillLoad() {
    const { property_id } = app_store.app_data;
    const validatedFromDate = this.validator.validateCheckin(this.fromDate);
    this.exposedBookingAvailabilityParams = {
      ...this.exposedBookingAvailabilityParams,
      adult_nbr: this.setDefaultAdultCount(),
      child_nbr: this.setDefaultChildCount(),
      from_date: validatedFromDate ? moment(this.fromDate, 'YYYY-MM-DD') : null,
      to_date: this.validator.validateCheckout(this.toDate, validatedFromDate) ? moment(this.toDate, 'YYYY-MM-DD') : null,
    };

    if (booking_store.bookingAvailabilityParams.from_date) {
      this.exposedBookingAvailabilityParams.from_date = moment(booking_store.bookingAvailabilityParams.from_date);
      this.exposedBookingAvailabilityParams.to_date = moment(booking_store.bookingAvailabilityParams.to_date);
    }
    if (booking_store.bookingAvailabilityParams.adult_nbr) {
      this.exposedBookingAvailabilityParams.adult_nbr = booking_store.bookingAvailabilityParams.adult_nbr;
      this.exposedBookingAvailabilityParams.child_nbr = booking_store.bookingAvailabilityParams.child_nbr;
    }
    this.changeExposedAvailabilityParams({
      propertyid: property_id,
      language: app_store.userPreferences.language_id,
      currency_ref: app_store.userPreferences.currency_id,
    });
    if (booking_store.childrenAges.length == 0) {
      booking_store.childrenAges = [...Array(this.exposedBookingAvailabilityParams.child_nbr)].fill('');
    }

    this.processAges();
    onAppDataChange('userPreferences', async newValue => {
      this.changeExposedAvailabilityParams({
        language: newValue.language_id,
        currency_ref: newValue.currency_id,
      });
      try {
        if (app_store.currentPage === 'booking') {
          this.resetBooking.emit(null);
        }
      } catch (error) {
        console.error(error);
      }
    });
    this.recheckAvailability();
  }

  @Watch('ages')
  handleAgesChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.processAges();
    }
  }

  @Watch('fromDate')
  handleFromDateChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      if (this.validator.validateCheckin(newValue)) {
        this.exposedBookingAvailabilityParams = {
          ...this.exposedBookingAvailabilityParams,
          from_date: moment(newValue, 'YYYY-MM-DD'),
        };
        if (this.fromDate && this.toDate && !this.validator.validateAdultCount(this.adultCount)) {
          this.checkAvailability();
        }
      }
    }
  }

  @Watch('toDate')
  handleToDateChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      const validatedFromDate = this.validator.validateCheckin(this.fromDate);
      if (validatedFromDate) {
        if (this.validator.validateCheckout(newValue, validatedFromDate)) {
          this.exposedBookingAvailabilityParams = {
            ...this.exposedBookingAvailabilityParams,
            to_date: moment(newValue, 'YYYY-MM-DD'),
          };
          this.recheckAvailability();
        }
      }
    }
  }

  @Watch('childrenCount')
  handleChildrenCountChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      if (!this.validator.validateChildrenCount(newValue)) {
        this.exposedBookingAvailabilityParams = {
          ...this.exposedBookingAvailabilityParams,
          child_nbr: +newValue,
        };
        booking_store.childrenAges = [...Array(this.exposedBookingAvailabilityParams.child_nbr)].fill('');
        this.recheckAvailability();
      }
    }
  }

  @Watch('adultCount')
  handleAdultCountChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      if (!this.validator.validateAdultCount(newValue)) {
        this.exposedBookingAvailabilityParams = {
          ...this.exposedBookingAvailabilityParams,
          adult_nbr: +newValue,
        };
        this.recheckAvailability();
      }
    }
  }

  @Listen('dateChange')
  handleDateChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { start, end } = e.detail;
    if (end) {
      this.changeExposedAvailabilityParams({
        from_date: moment(start).locale('en'),
        to_date: moment(end).locale('en'),
      });
    } else if (this.exposedBookingAvailabilityParams.to_date && !end) {
      this.changeExposedAvailabilityParams({
        from_date: moment(start).locale('en'),
        to_date: null,
      });
    } else {
      this.changeExposedAvailabilityParams({ from_date: moment(start).locale('en') });
    }
    modifyQueryParam('checkin', this.exposedBookingAvailabilityParams.from_date?.locale('en')?.format('YYYY-MM-DD'));
    modifyQueryParam('checkout', this.exposedBookingAvailabilityParams.to_date?.locale('en')?.format('YYYY-MM-DD'));
    if (
      !!this.exposedBookingAvailabilityParams.adult_nbr &&
      !!this.exposedBookingAvailabilityParams.from_date &&
      !!this.exposedBookingAvailabilityParams.to_date &&
      app_store.fetchedBooking
    ) {
      this.checkAvailability();
    }
  }

  @Listen('addAdultsAndChildren')
  handleAdultChildChange(e: CustomEvent<AddAdultsAndChildrenEvent>) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const { adult_nbr, child_nbr, childrenAges, infant_nbr } = e.detail;
    booking_store.childrenAges = [...childrenAges];
    this.changeExposedAvailabilityParams({ adult_nbr, child_nbr, infant_nbr });
    modifyQueryParam('adults', this.exposedBookingAvailabilityParams.adult_nbr?.toString());
    modifyQueryParam('children', this.exposedBookingAvailabilityParams.child_nbr?.toString());
    if (infant_nbr) {
      modifyQueryParam('ages', encodeURIComponent(childrenAges.join('_')));
    }
  }

  private setDefaultAdultCount() {
    if (this.validator.validateAdultCount(this.adultCount)) {
      return 2;
    }
    const adCountNumber = Number(this.adultCount);
    return adCountNumber > app_store.property.adult_child_constraints.adult_max_nbr ? app_store.property.adult_child_constraints.adult_max_nbr : adCountNumber;
  }

  private setDefaultChildCount() {
    if (this.validator.validateChildrenCount(this.childrenCount)) {
      return 0;
    }
    const childCountNumber = Number(this.childrenCount);
    return childCountNumber > app_store.property.adult_child_constraints.child_max_nbr ? app_store.property.adult_child_constraints.child_max_nbr : childCountNumber;
  }

  private recheckAvailability() {
    if (!this.fromDate || !this.toDate || !this.adultCount) {
      return;
    }
    const isValidFromDate = this.validator.validateCheckin(this.fromDate);
    const isValidToDate = this.validator.validateCheckout(this.toDate, isValidFromDate);
    const isValidAdultCount = this.validator.validateAdultCount(this.adultCount);
    if (!isValidAdultCount && isValidFromDate && isValidToDate) {
      this.checkAvailability();
    }
  }

  private processAges() {
    if (this.exposedBookingAvailabilityParams.child_nbr === 0) {
      return;
    }
    if (this.validator.validateAges(this.ages)) {
      const ages = this.ages.split('_');
      ages.slice(0, this.exposedBookingAvailabilityParams.child_nbr + 1).forEach((age, index) => {
        booking_store.childrenAges[index] = age.toString();
      });
      const infant_nbr = calculateInfantNumber(booking_store.childrenAges);
      this.exposedBookingAvailabilityParams = {
        ...this.exposedBookingAvailabilityParams,
        infant_nbr,
      };
    }
    if (this.exposedBookingAvailabilityParams.child_nbr > 0 && booking_store.childrenAges.some(c => c === '')) {
      setTimeout(() => {
        this.personCounter?.open();
      }, 100);
    }
  }

  private async checkAvailability() {
    const params = ExposedBookingAvailability.parse(this.exposedBookingAvailabilityParams);
    if (app_store.app_data.injected) {
      const { from_date, to_date, adult_nbr, child_nbr, infant_nbr } = params;
      const fromDate = `checkin=${from_date?.format('YYYY-MM-DD')}`;
      const toDate = `checkout=${to_date?.format('YYYY-MM-DD')}`;
      const adults = `adults=${adult_nbr}`;
      const children = child_nbr > 0 ? `children=${child_nbr}` : '';
      const affiliate = app_store.app_data.affiliate ? `aff=${app_store.app_data.affiliate.afname}` : '';
      const currency = `cur=${app_store.userPreferences.currency_id}`;
      const language = `lang=${app_store.userPreferences.language_id}`;
      const loyalty = booking_store.bookingAvailabilityParams.loyalty ? 'loyalty=true' : '';
      const promo_key = booking_store.bookingAvailabilityParams.coupon ? `promo=${booking_store.bookingAvailabilityParams.coupon}` : '';
      const agent = booking_store.bookingAvailabilityParams.agent ? `agent=${booking_store.bookingAvailabilityParams.agent}` : '';
      const ages = infant_nbr > 0 && !booking_store.childrenAges.every(c => c === '') ? `ages=${booking_store.childrenAges.join('_')}` : '';
      // const queryParams = [fromDate, toDate, adults, children, affiliate, language, currency, loyalty, promo_key, agent];
      const queryParams = [fromDate, toDate, adults, ages, children, affiliate, language, currency, loyalty, promo_key, agent];
      const queryString = queryParams.filter(param => param !== '').join('&');

      return (location.href = `https://${app_store.property.perma_link}.bookingmystay.com?${queryString}`);
    }

    if (booking_store.childrenAges.length > 0 && booking_store.childrenAges.some(c => c === '') && this.exposedBookingAvailabilityParams.child_nbr > 0) {
      if (!this.errorCause) {
        this.errorCause = [];
      }
      console.log('error');
      this.errorCause.push('adult_child');
      return;
    }
    booking_store.bookingAvailabilityParams = {
      ...booking_store.bookingAvailabilityParams,
      from_date: params.from_date,
      to_date: params.to_date,
      adult_nbr: params.adult_nbr,
      child_nbr: params.child_nbr,
    };
    if (passedBookingCutoff()) {
      return;
    }
    this.scrollToRoomType.emit(null);
    booking_store.resetBooking = true;
    const { infant_nbr, ...rest } = this.exposedBookingAvailabilityParams;
    await this.propertyService.getExposedBookingAvailability({
      ...rest,
      child_nbr: this.exposedBookingAvailabilityParams.child_nbr,
      // child_nbr: this.exposedBookingAvailabilityParams.child_nbr - this.exposedBookingAvailabilityParams.infant_nbr,
      promo_key: booking_store.bookingAvailabilityParams.coupon || '',
      is_in_agent_mode: !!booking_store.bookingAvailabilityParams.agent || false,
      agent_id: booking_store.bookingAvailabilityParams.agent?.id || 0,
      is_in_loyalty_mode: booking_store.bookingAvailabilityParams.loyalty ? true : !!booking_store.bookingAvailabilityParams.coupon,
      is_in_affiliate_mode: !!app_store.app_data.affiliate,
      affiliate_id: app_store.app_data.affiliate ? app_store.app_data.affiliate.id : null,
    });
    app_store.fetchedBooking = true;
  }

  private async handleCheckAvailability() {
    try {
      this.isLoading = true;
      await this.checkAvailability();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(error.errors);
        for (const err of error.errors) {
          if (!this.errorCause) {
            this.errorCause = [];
          }
          const error_cause = err.path[0].toString();

          if (error_cause.includes('date') && !this.errorCause.find(c => c === 'date')) {
            this.errorCause.push('date');
          }
          if (error_cause.includes('nbr')) {
            this.errorCause.push('adult_child');
          }
        }
      }
    } finally {
      this.isLoading = false;
    }
  }

  private changeExposedAvailabilityParams(params: Partial<TExposedBookingAvailability>) {
    this.exposedBookingAvailabilityParams = {
      ...this.exposedBookingAvailabilityParams,
      ...params,
    };
  }

  private shouldRenderErrorToast() {
    // Check for date-related errors
    if (this.errorCause?.find(c => c === 'date') !== undefined) {
      // Both dates must be present to clear the error
      if (this.exposedBookingAvailabilityParams.from_date && this.exposedBookingAvailabilityParams.to_date) {
        this.errorCause = this.errorCause?.filter(c => c !== 'date');
      }
    }

    // Check for adult/child count related errors
    if (this.errorCause?.find(c => c === 'adult_child')) {
      // There must be at least one adult to clear the error
      if (this.exposedBookingAvailabilityParams.adult_nbr > 0) {
        this.errorCause = this.errorCause?.filter(c => c !== 'adult_child');
      }
    }
    return this.errorCause?.length > 0;
  }

  disconnectedCallback() {
    if (this.popoverInstance) {
      this.popoverInstance.destroy();
    }
    if (this.toast_timeout) {
      clearTimeout(this.toast_timeout);
    }
  }

  render() {
    this.shouldRenderErrorToast();
    const show_loyalty = app_store.property?.promotions?.some(p => p.is_loyalty);
    const show_coupon = app_store.property?.promotions?.some(p => p.is_loyalty);
    const showPromotions = app_store?.property?.promotions && (show_coupon || show_loyalty);
    return (
      <div class={`availability-container ${showPromotions ? 'promotions' : ''} xl:text-cyan-50`}>
        <div class={`availability-inputs ${showPromotions ? 'promotions' : ''}`}>
          <ir-date-popup
            data-state={this.errorCause?.find(c => c === 'date') ? 'error' : ''}
            dates={{
              start: this.exposedBookingAvailabilityParams?.from_date ? moment(this.exposedBookingAvailabilityParams.from_date, 'YYYY-MM-DD') : null,
              end: this.exposedBookingAvailabilityParams?.to_date ? moment(this.exposedBookingAvailabilityParams.to_date, 'YYYY-MM-DD') : null,
            }}
            class="date-popup"
          ></ir-date-popup>
          <ir-adult-child-counter
            data-state={this.errorCause?.find(c => c === 'adult_child') ? 'error' : ''}
            adultCount={this.exposedBookingAvailabilityParams.adult_nbr}
            childrenCount={this.exposedBookingAvailabilityParams.child_nbr}
            minAdultCount={0}
            maxAdultCount={app_store.property.adult_child_constraints.adult_max_nbr}
            maxChildrenCount={app_store.property.adult_child_constraints.child_max_nbr}
            childMaxAge={app_store.property.adult_child_constraints.child_max_age}
            class="adult-child-counter"
            ref={el => (this.personCounter = el)}
            baseChildrenAges={booking_store.childrenAges}
            onCheckAvailability={() => this.handleCheckAvailability()}
          ></ir-adult-child-counter>
          <div class={'hidden sm:block'}>
            <ir-button
              isLoading={this.isLoading}
              onButtonClick={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.handleCheckAvailability();
              }}
              size="pill"
              disabled={passedBookingCutoff()}
              variants="icon-primary"
              iconName="search"
              label="Check availability"
            ></ir-button>
          </div>
          {/* </div> */}
          <div class="full-width-on-mobile sm:hidden">
            <ir-button
              isLoading={this.isLoading}
              onButtonClick={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.handleCheckAvailability();
              }}
              size="md"
              label={localizedWords.entries.Lcz_Search}
              buttonStyles={{ width: '100%' }}
            ></ir-button>
          </div>
        </div>

        {app_store?.property?.promotions && (
          <div class="promotions-container">
            <ir-coupon-dialog class="coupon-dialog"></ir-coupon-dialog>
            <ir-loyalty class="loyalty"></ir-loyalty>
          </div>
        )}
      </div>
    );
  }
}
