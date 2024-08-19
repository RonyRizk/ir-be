import { Component, Event, EventEmitter, h, Listen, Prop, State, Watch } from '@stencil/core';
import { ExposedBookingAvailability, TExposedBookingAvailability } from './availability';
import { format } from 'date-fns';
import { ZodError } from 'zod';
import { onAppDataChange } from '@/stores/app.store';
import { PropertyService } from '@/services/api/property.service';
import app_store from '@/stores/app.store';
import booking_store from '@/stores/booking';
import { v4 } from 'uuid';
import { AvailabiltyService } from '@/services/app/availability.service';

@Component({
  tag: 'ir-availibility-header',
  styleUrl: 'ir-availibility-header.css',
  shadow: true,
})
export class IrAvailibilityHeader {
  @Prop() fromDate: string;
  @Prop() toDate: string;
  @Prop() adultCount: string;
  @Prop() childrenCount: string;

  @State() exposedBookingAvailabiltyParams: TExposedBookingAvailability = {
    adult_nbr: 0,
    child_nbr: 0,
    currency_ref: 'USD',
    language: 'en',
    room_type_ids: [],
    propertyid: 42,
    is_in_loyalty_mode: booking_store.bookingAvailabilityParams.loyalty ? true : !!booking_store.bookingAvailabilityParams.coupon,
    promo_key: booking_store.bookingAvailabilityParams.coupon || '',
    is_in_agent_mode: !!booking_store.bookingAvailabilityParams.agent || false,
    agent_id: booking_store.bookingAvailabilityParams.agent || 0,
  };
  @State() target: HTMLElement = null;

  @State() errorCause: ('date' | 'adult_child')[] | null = null;
  @State() isLoading = false;

  @Event() resetBooking: EventEmitter<null>;
  @Event() scrollToRoomType: EventEmitter<null>;

  private popoverInstance = null;
  private toast_timeout: NodeJS.Timeout;
  private identifier: string;

  private propertyService = new PropertyService();
  private availabiltyService = new AvailabiltyService();

  // private popperInstance: any;
  // private personCounter: HTMLIrAdultChildCounterElement;

  componentWillLoad() {
    const { token, property_id } = app_store.app_data;
    this.propertyService.setToken(token);
    this.availabiltyService.subscribe(() => this.disableLoading());
    this.exposedBookingAvailabiltyParams = {
      ...this.exposedBookingAvailabiltyParams,
      adult_nbr: +this.adultCount || 0,
      child_nbr: +this.childrenCount || 0,
      from_date: this.fromDate,
      to_date: this.toDate,
    };
    if (booking_store.bookingAvailabilityParams.from_date) {
      this.exposedBookingAvailabiltyParams.from_date = format(booking_store.bookingAvailabilityParams.from_date, 'yyyy-MM-dd');
      this.exposedBookingAvailabiltyParams.to_date = format(booking_store.bookingAvailabilityParams.to_date, 'yyyy-MM-dd');
    }
    if (booking_store.bookingAvailabilityParams.adult_nbr) {
      this.exposedBookingAvailabiltyParams.adult_nbr = booking_store.bookingAvailabilityParams.adult_nbr;
      this.exposedBookingAvailabiltyParams.child_nbr = booking_store.bookingAvailabilityParams.child_nbr;
    }
    this.changeExposedAvailabilityParams({
      propertyid: property_id,
      language: app_store.userPreferences.language_id,
      currency_ref: app_store.userPreferences.currency_id,
    });
    onAppDataChange('userPreferences', async newValue => {
      this.changeExposedAvailabilityParams({
        language: newValue.language_id,
        currency_ref: newValue.currency_id,
      });
      try {
        if (app_store.currentPage === 'booking') {
          this.resetBooking.emit(null);
        }
      } catch (error) {}
    });
    if (this.fromDate && this.toDate && this.adultCount) {
      this.checkAvailability();
    }
  }

  disableLoading() {
    if (this.isLoading) {
      this.isLoading = false;
    }
  }
  @Watch('fromDate')
  handleFromDateChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.exposedBookingAvailabiltyParams = {
        ...this.exposedBookingAvailabiltyParams,
        from_date: newValue,
      };
      if (this.fromDate && this.toDate && this.adultCount) {
        this.checkAvailability();
      }
    }
  }
  @Watch('toDate')
  handleToDateChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.exposedBookingAvailabiltyParams = {
        ...this.exposedBookingAvailabiltyParams,
        to_date: newValue,
      };
      if (this.fromDate && this.toDate && this.adultCount) {
        this.checkAvailability();
      }
    }
  }
  @Watch('childrenCount')
  handleChildrenCountChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.exposedBookingAvailabiltyParams = {
        ...this.exposedBookingAvailabiltyParams,
        child_nbr: +newValue,
      };
      if (this.fromDate && this.toDate && this.adultCount) {
        this.checkAvailability();
      }
    }
  }
  @Watch('adultCount')
  handleAdultCountChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.exposedBookingAvailabiltyParams = {
        ...this.exposedBookingAvailabiltyParams,
        adult_nbr: +newValue,
      };
      if (this.fromDate && this.toDate && this.adultCount) {
        this.checkAvailability();
      }
    }
  }

  async checkAvailability() {
    const params = ExposedBookingAvailability.parse(this.exposedBookingAvailabiltyParams);
    if (app_store.app_data.injected) {
      const { from_date, to_date, adult_nbr, child_nbr } = params;
      const fromDate = `checkin=${from_date}`;
      const toDate = `checkout=${to_date}`;
      const adults = `adults=${adult_nbr}`;
      const children = child_nbr > 0 ? `children=${child_nbr}` : '';
      const affiliate = app_store.app_data.affiliate ? `aff=${app_store.app_data.affiliate.afname}` : '';
      const currency = `cur=${app_store.userPreferences.currency_id}`;
      const language = `lang=${app_store.userPreferences.language_id}`;
      const loyalty = booking_store.bookingAvailabilityParams.loyalty ? 'loyalty=true' : '';
      const promo_key = booking_store.bookingAvailabilityParams.coupon ? `promo=${booking_store.bookingAvailabilityParams.coupon}` : '';
      const agent = booking_store.bookingAvailabilityParams.agent ? `agent=${booking_store.bookingAvailabilityParams.agent}` : '';
      const queryParams = [fromDate, toDate, adults, children, affiliate, language, currency, loyalty, promo_key, agent];
      const queryString = queryParams.filter(param => param !== '').join('&');
      return (location.href = `https://${app_store.property.perma_link}.bookingmystay.com?${queryString}`);
    }
    this.identifier = v4();
    this.availabiltyService.initSocket(this.identifier);
    booking_store.bookingAvailabilityParams = {
      ...booking_store.bookingAvailabilityParams,
      from_date: new Date(params.from_date),
      to_date: new Date(params.to_date),
      adult_nbr: params.adult_nbr,
      child_nbr: params.child_nbr,
    };
    if (window.innerWidth < 640) {
      this.scrollToRoomType.emit(null);
    }
    await this.propertyService.getExposedBookingAvailability({
      params: {
        ...this.exposedBookingAvailabiltyParams,
        promo_key: booking_store.bookingAvailabilityParams.coupon || '',
        is_in_agent_mode: !!booking_store.bookingAvailabilityParams.agent || false,
        agent_id: booking_store.bookingAvailabilityParams.agent || 0,
        is_in_loyalty_mode: booking_store.bookingAvailabilityParams.loyalty ? true : !!booking_store.bookingAvailabilityParams.coupon,
        is_in_affiliate_mode: !!app_store.app_data.affiliate,
        affiliate_id: app_store.app_data.affiliate ? app_store.app_data.affiliate.id : null,
      },
      identifier: this.identifier,
      mode: 'default',
    });
  }

  async handleCheckAvailability() {
    try {
      this.isLoading = true;
      await this.checkAvailability();
      app_store.fetchedBooking = true;
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(error.errors);
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

  changeExposedAvailabilityParams(params: Partial<TExposedBookingAvailability>) {
    this.exposedBookingAvailabiltyParams = {
      ...this.exposedBookingAvailabiltyParams,
      ...params,
    };
  }

  @Listen('dateChange')
  handleDateChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { start, end } = e.detail;
    if (end) {
      this.changeExposedAvailabilityParams({
        from_date: format(start, 'yyyy-MM-dd').toString(),
        to_date: format(end, 'yyyy-MM-dd').toString(),
      });
    } else if (this.exposedBookingAvailabiltyParams.to_date && !end) {
      this.changeExposedAvailabilityParams({
        from_date: format(start, 'yyyy-MM-dd').toString(),
        to_date: null,
      });
    } else {
      this.changeExposedAvailabilityParams({ from_date: format(start, 'yyyy-MM-dd') });
    }
  }

  @Listen('addAdultsAndChildren')
  handleAdultChildChange(e: CustomEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    this.changeExposedAvailabilityParams({ ...e.detail });
  }

  disconnectedCallback() {
    if (this.popoverInstance) {
      this.popoverInstance.destroy();
    }
    if (this.toast_timeout) {
      clearTimeout(this.toast_timeout);
    }
    this.availabiltyService.unsubscribe(() => this.disableLoading());
    this.availabiltyService.disconnectSocket();
  }
  shouldRenderErrorToast() {
    // Check for date-related errors
    if (this.errorCause?.find(c => c === 'date') !== undefined) {
      // Both dates must be present to clear the error
      if (this.exposedBookingAvailabiltyParams.from_date && this.exposedBookingAvailabiltyParams.to_date) {
        this.errorCause = this.errorCause?.filter(c => c !== 'date');
      }
    }

    // Check for adult/child count related errors
    if (this.errorCause?.find(c => c === 'adult_child')) {
      // There must be at least one adult to clear the error
      if (this.exposedBookingAvailabiltyParams.adult_nbr > 0) {
        this.errorCause = this.errorCause?.filter(c => c !== 'adult_child');
      }
    }
    return this.errorCause?.length > 0;
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
              start: this.exposedBookingAvailabiltyParams?.from_date ? new Date(this.exposedBookingAvailabiltyParams.from_date) : null,
              end: this.exposedBookingAvailabiltyParams?.to_date ? new Date(this.exposedBookingAvailabiltyParams.to_date) : null,
            }}
            class="date-popup"
          ></ir-date-popup>
          {/* <div class="availability-controls"> */}
          <ir-adult-child-counter
            data-state={this.errorCause?.find(c => c === 'adult_child') ? 'error' : ''}
            adultCount={this.exposedBookingAvailabiltyParams.adult_nbr}
            childrenCount={this.exposedBookingAvailabiltyParams.child_nbr}
            minAdultCount={0}
            maxAdultCount={app_store.property.adult_child_constraints.adult_max_nbr}
            maxChildrenCount={app_store.property.adult_child_constraints.child_max_nbr}
            childMaxAge={app_store.property.adult_child_constraints.child_max_age}
            class="adult-child-counter"
            // ref={el => (this.personCounter = el)}
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
              label="search"
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
