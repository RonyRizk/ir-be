import { Component, h, Element, Prop, Watch, Fragment, State, Host } from '@stencil/core';
import { TContainerStyle } from './types';
import localization_store from '@/stores/app.store';
import { CommonService } from '@/services/api/common.service';
import { PropertyService } from '@/services/api/property.service';
import axios from 'axios';
import app_store from '@/stores/app.store';
import moment from 'moment/min/moment-with-locales';
import localizedWords from '@/stores/localization.store';
import Token from '@/models/Token';
import { IExposedProperty } from '@/models/property';
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
  @State() property: IExposedProperty;
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
  @State() linkedProperties: IExposedProperty[] = [];
  @State() selectedProperty: IExposedProperty;

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
      const properties = this.p.split(',').map(t => t.trim());
      const [property, linkedProperties] = await Promise.all([
        this.propertyService.getExposedProperty({
          id: this.propertyId,
          language: this.language,
          aname: properties.length > 0 ? properties[0] : this.p,
          perma_link: this.perma_link,
        }),
        properties.length < 2
          ? Promise.resolve(null)
          : this.propertyService.getExposedProperties({
              anames: properties,
              language: this.language,
            }),
        this.commonService.getExposedLanguage(),
        this.propertyService.getExposedNonBookableNights({
          porperty_id: this.propertyId,
          from_date: moment().format('YYYY-MM-DD'),
          to_date: moment().add(1, 'years').format('YYYY-MM-DD'),
          perma_link: this.perma_link,
          aname: properties.length > 0 ? properties[0] : this.p,
        }),
      ]);
      this.linkedProperties = linkedProperties ?? [];
      this.selectedProperty = this.linkedProperties.length > 0 ? this.linkedProperties[0] : property;
      this.property = property;
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
    const currentDomain = `${this.selectedProperty.perma_link}.${subdomainURL}`;
    const { from_date, to_date } = this.dates;
    const { adultCount, childrenCount } = this.guests;
    const fromDate = from_date ? `checkin=${moment(from_date).format('YYYY-MM-DD')}` : '';
    const toDate = to_date ? `checkout=${moment(to_date).format('YYYY-MM-DD')}` : '';
    const adults = adultCount > 0 ? `adults=${adultCount}` : '';
    const children = childrenCount > 0 ? `children=${childrenCount}` : '';
    const roomTypeId = this.roomTypeId ? `u=${this.roomTypeId}` : '';
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
              {this.property.adult_child_constraints.child_max_age > 0 && (
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
        this.guestPopover?.forceClose();
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
    this.guestPopover?.forceClose();
    return true;
  }
  render() {
    if (this.isLoading) {
      return null;
    }
    const isMultiProperties = this.linkedProperties?.length > 1;
    return (
      <Host data-multi={isMultiProperties ? 'true' : 'false'}>
        <div class="booking-widget-container" data-multi={isMultiProperties ? 'true' : 'false'} ref={el => (this.containerRef = el)} style={this.contentContainerStyle}>
          <div class={'hovered-container'}></div>
          {isMultiProperties && (
            <select
              class="booking-widget__linked-properties"
              onChange={e => {
                const propertyId = (e.target as HTMLSelectElement).value;
                this.selectedProperty = this.linkedProperties.find(p => p.id.toString() === propertyId);
              }}
            >
              {this.linkedProperties.map(property => (
                <option selected={this.selectedProperty.id.toString() === property.id.toString()} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          )}
          <Fragment>
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
                  maxSpanDays={this.property.max_nights}
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
                maxAdultCount={this.property?.adult_child_constraints.adult_max_nbr}
                maxChildrenCount={this.property?.adult_child_constraints.child_max_nbr}
                childMaxAge={this.property?.adult_child_constraints.child_max_age}
                onUpdateCounts={e => (this.guests = { ...e.detail })}
                class={'h-full'}
                onCloseGuestCounter={() => this.guestPopover.forceClose()}
              ></ir-guest-counter>
            </ir-popover>
          </Fragment>
          <button class="btn-flip" onClick={this.handleBooknow.bind(this)}>
            {isMultiProperties ? (
              <svg xmlns="http://www.w3.org/2000/svg" height={24} width={24} viewBox="0 0 640 640">
                <path
                  fill="currentColor"
                  d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"
                />
              </svg>
            ) : (
              'Book now'
            )}
          </button>
        </div>
      </Host>
    );
  }
}
