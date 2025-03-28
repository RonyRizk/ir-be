import { Component, h, Element, Prop, Watch, Fragment, State } from '@stencil/core';
import { TContainerStyle } from './types';
import localization_store from '@/stores/app.store';
import { CommonService } from '@/services/api/common.service';
import { PropertyService } from '@/services/api/property.service';
import axios from 'axios';
import app_store from '@/stores/app.store';
import moment from 'moment/min/moment-with-locales';
import localizedWords from '@/stores/localization.store';
import Token from '@/models/Token';
@Component({
  tag: 'ir-widget',
  styleUrl: 'ir-booking-widget.css',
  shadow: true,
})
export class IrBookingWidget {
  @Element() el: HTMLIrWidgetElement;

  @Prop({ reflect: true }) position: 'fixed' | 'block' = 'fixed';
  @Prop() contentContainerStyle: TContainerStyle;
  @Prop() propertyId: number = 42;
  @Prop() perma_link: string = null;
  @Prop() p: string = null;
  @Prop() language: string = 'en';
  @Prop() roomTypeId: string | null = null;
  @Prop() aff: string = null;
  @Prop() delay: number = 300;

  @State() isPopoverOpen: boolean;
  @State() dateModifiers: any;
  @State() isLoading: boolean;
  @State() isGuestPopoverOpen: boolean;
  @State() dates: { from_date: Date | null; to_date: Date | null } = {
    from_date: null,
    to_date: null,
  };
  @State() guests: { adultCount: number; childrenCount: number; infants: number; childrenAges: string[] } = {
    adultCount: 2,
    childrenCount: 0,
    infants: 0,
    childrenAges: [],
  };

  private baseUrl: string = 'https://gateway.igloorooms.com/IRBE';
  private popover: HTMLIrPopoverElement;
  private token = new Token();

  private commonService = new CommonService();
  private propertyService = new PropertyService();
  private guestPopover: HTMLIrPopoverElement;
  private containerRef: HTMLDivElement;
  private elTimout: NodeJS.Timeout;
  private error: boolean;

  componentWillLoad() {
    this.initApp();
    app_store.userPreferences = {
      language_id: this.language,
      currency_id: 'usd',
    };
    this.initProperty();
  }

  componentDidLoad() {
    console.log('the widget is loaded');
    if (this.position === 'fixed') {
      console.log('widget appended to body');
      document.body.appendChild(this.el);
    }
  }
  private initApp() {
    this.modifyContainerStyle();
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = this.baseUrl;
    this.resetPageFontSize();
  }

  private resetPageFontSize() {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = 'html { font-size: 16px; }';
    document.head.appendChild(styleEl);
  }

  async initProperty() {
    try {
      this.isLoading = true;
      const token = await this.commonService.getBEToken();
      this.token.setToken(token);
      await Promise.all([
        this.propertyService.getExposedProperty({
          id: this.propertyId,
          language: this.language,
          aname: this.p,
          perma_link: this.perma_link,
        }),
        this.commonService.getExposedLanguage(),
        this.propertyService.getExposedNonBookableNights({
          porperty_id: this.propertyId,
          from_date: moment().format('YYYY-MM-DD'),
          to_date: moment().add(1, 'years').format('YYYY-MM-DD'),
          perma_link: this.perma_link,
          aname: this.p,
        }),
      ]);
      this.dateModifiers = this.getDateModifiers();
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
      this.elTimout = setTimeout(() => {
        this.containerRef.style.opacity = '1';
      }, this.delay);
    }
  }

  @Watch('contentContainerStyle')
  handleContentContainerStyle() {
    this.modifyContainerStyle();
  }

  private modifyContainerStyle() {
    if (this.contentContainerStyle && this.contentContainerStyle.borderColor) {
      this.el.style.setProperty('--ir-widget-border-color', this.contentContainerStyle.borderColor);
    }
  }
  handleBooknow() {
    if (!this.validateChildrenAges()) return;
    let subdomainURL = `bookingmystay.com`;
    const currentDomain = `${app_store.property.perma_link}.${subdomainURL}`;
    const { from_date, to_date } = this.dates;
    const { adultCount, childrenCount } = this.guests;
    const fromDate = from_date ? `checkin=${moment(from_date).format('YYYY-MM-DD')}` : '';
    const toDate = to_date ? `checkout=${moment(to_date).format('YYYY-MM-DD')}` : '';
    const adults = adultCount > 0 ? `adults=${adultCount}` : '';
    const children = childrenCount > 0 ? `children=${childrenCount}` : '';
    const roomTypeId = this.roomTypeId ? `rtid=${this.roomTypeId}` : '';
    const affiliate = this.aff ? `aff=${this.aff}` : '';
    const ages = this.guests.childrenCount > 0 && this.guests.childrenAges.length > 0 ? `ages=${this.guests.childrenAges.join('_')}` : '';
    const queryParams = [fromDate, toDate, adults, children, roomTypeId, affiliate, ages];
    const queryString = queryParams.filter(param => param !== '').join('&');
    window.open(`https://${currentDomain}?${queryString}`, '_blank');
  }
  private getDateModifiers() {
    if (!Object.keys(app_store.nonBookableNights).length) {
      return undefined;
    }
    const nights = {};
    Object.keys(app_store?.nonBookableNights)?.forEach(nbn => {
      nights[nbn] = {
        disabled: true,
      };
    });
    return nights;
  }
  private renderDateTrigger() {
    const from = this.dates?.from_date;
    const to = this.dates?.to_date;
    let fromLabel = '';
    let toLabel = '';
    if (from) {
      fromLabel = moment(from).format('DD MMM YYYY');
    }
    if (to) {
      toLabel = moment(to).format('DD MMM YYYY');
    }
    return (
      <div class="date-trigger" slot="trigger">
        <ir-icons name="calendar" svgClassName="size-4"></ir-icons>
        {fromLabel && toLabel ? (
          <div>
            <p>
              <span>{fromLabel}</span>
              <span> - </span>
              <span>{toLabel}</span>
            </p>
          </div>
        ) : (
          <div>
            <p>Your dates</p>
          </div>
        )}
      </div>
    );
  }
  private renderAdultChildTrigger() {
    const { adultCount, childrenCount } = this.guests;
    return (
      <div class="guests-trigger" slot="trigger">
        <ir-icons name="user" svgClassName="size-4"></ir-icons>
        <p class={'guests'}>
          {adultCount > 0 ? (
            <Fragment>
              <span class="lowercase">
                {adultCount} {adultCount === 1 ? localizedWords.entries.Lcz_Adult : localizedWords.entries.Lcz_Adults}
              </span>
              {app_store.property.adult_child_constraints.child_max_age > 0 && (
                <span class="lowercase">
                  , {childrenCount} {childrenCount === 1 ? localizedWords.entries.Lcz_Child : localizedWords.entries.Lcz_Children}
                </span>
              )}
            </Fragment>
          ) : (
            <span>Guests</span>
          )}
        </p>
      </div>
    );
  }
  disconnectedCallback() {
    if (this.elTimout) {
      clearTimeout(this.elTimout);
    }
  }
  private handlePopoverToggle(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.isGuestPopoverOpen = e.detail;
    console.log('here');

    if (!this.isGuestPopoverOpen) {
      if (this.guests.childrenCount === 0) {
        this.guestPopover.forceClose();
      } else {
        this.validateChildrenAges();
      }
    }
  }
  private validateChildrenAges() {
    if (this.guests.childrenAges.some(c => c === '')) {
      this.error = true;
      return false;
    }
    this.guestPopover.forceClose();
    return true;
  }
  render() {
    if (this.isLoading) {
      return null;
    }
    return (
      <Fragment>
        <div class="booking-widget-container" ref={el => (this.containerRef = el)} style={this.contentContainerStyle}>
          <div class={'hovered-container'}></div>
          <ir-popover
            autoAdjust={false}
            allowFlip={false}
            class={'ir-popover'}
            showCloseButton={false}
            placement={this.position === 'fixed' ? 'top-start' : 'auto'}
            ref={el => (this.popover = el)}
            onOpenChange={e => {
              this.isPopoverOpen = e.detail;
              if (!this.isPopoverOpen) {
                if (this.dates.from_date && !this.dates.to_date) {
                  this.dates = {
                    ...this.dates,
                    to_date: moment(this.dates.from_date).add(1, 'days').toDate(),
                  };
                }
              }
            }}
          >
            {this.renderDateTrigger()}
            <div slot="popover-content" class="popup-container w-full border-0 bg-white p-4  shadow-none sm:w-auto sm:border  ">
              <ir-date-range
                dateModifiers={this.dateModifiers}
                minDate={moment().add(-1, 'days')}
                style={{ '--radius': 'var(--ir-widget-radius)' }}
                fromDate={this.dates?.from_date ? moment(this.dates.from_date) : null}
                toDate={this.dates?.to_date ? moment(this.dates.to_date) : null}
                locale={localization_store.selectedLocale}
                maxSpanDays={app_store.property.max_nights}
                onDateChange={e => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  const { end, start } = e.detail;
                  if (end && this.isPopoverOpen) {
                    this.popover.toggleVisibility();
                  }
                  this.dates = {
                    from_date: start,
                    to_date: end,
                  };
                }}
              ></ir-date-range>
            </div>
          </ir-popover>
          <ir-popover
            outsideEvents="none"
            autoAdjust={false}
            allowFlip={false}
            ref={el => (this.guestPopover = el)}
            class={'ir-popover'}
            showCloseButton={false}
            placement={this.position === 'fixed' ? 'top-start' : 'auto'}
            onOpenChange={this.handlePopoverToggle.bind(this)}
          >
            {this.renderAdultChildTrigger()}

            <ir-guest-counter
              slot="popover-content"
              error={this.error}
              adults={this.guests?.adultCount}
              child={this.guests?.childrenCount}
              minAdultCount={0}
              maxAdultCount={app_store?.property?.adult_child_constraints.adult_max_nbr}
              maxChildrenCount={app_store?.property?.adult_child_constraints.child_max_nbr}
              childMaxAge={app_store.property?.adult_child_constraints.child_max_age}
              onUpdateCounts={e => (this.guests = { ...e.detail })}
              class={'h-full'}
              onCloseGuestCounter={() => this.guestPopover.forceClose()}
            ></ir-guest-counter>
          </ir-popover>
          <button class="btn-flip" onClick={this.handleBooknow.bind(this)}>
            Book now
          </button>
        </div>
      </Fragment>
    );
  }
}
