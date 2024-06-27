import { Component, h, Element, Prop, Watch, Fragment, State } from '@stencil/core';
import { TContainerStyle } from './types';
import localization_store from '@/stores/app.store';
import { CommonService } from '@/services/api/common.service';
import { PropertyService } from '@/services/api/property.service';
import axios from 'axios';
import app_store from '@/stores/app.store';
import { addDays, format } from 'date-fns';
import localizedWords from '@/stores/localization.store';
@Component({
  tag: 'ir-booking-widget',
  styleUrl: 'ir-booking-widget.css',
  shadow: true,
})
export class IrBookingWidget {
  @Element() el: HTMLIrBookingWidgetElement;

  @Prop({ reflect: true }) position: 'sticky' | 'block' = 'sticky';
  @Prop() contentContainerStyle: TContainerStyle;
  @Prop() propertyId: number = 42;
  @Prop() perma_link: string = null;
  @Prop() aName: string = null;
  @Prop() baseUrl: string;
  @Prop() language: string = 'en';
  @Prop() roomTypeId: string | null = '110';

  @State() isPopoverOpen: boolean;
  @State() isLoading: boolean;
  @State() dates: { from_date: Date | null; to_date: Date | null } = {
    from_date: null,
    to_date: null,
  };
  @State() guests: { adultCount: number; childrenCount: number } = {
    adultCount: 0,
    childrenCount: 0,
  };

  private popover: HTMLIrPopoverElement;
  private token: string;

  private commonService = new CommonService();
  private propertyService = new PropertyService();
  guestPopover: HTMLIrPopoverElement;

  private initApp() {
    this.modifyContainerStyle();
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = this.baseUrl;
  }
  async componentWillLoad() {
    this.initApp();
    this.token = await this.commonService.getBEToken();
    app_store.userPreferences = {
      language_id: this.language,
      currency_id: 'usd',
    };
    this.commonService.setToken(this.token);
    this.propertyService.setToken(this.token);
    this.initProperty();
  }
  async initProperty() {
    try {
      this.isLoading = true;
      await Promise.all([
        this.propertyService.getExposedProperty({
          id: this.propertyId,
          language: this.language,
          aname: this.aName,
          perma_link: this.perma_link,
        }),
        this.commonService.getExposedLanguage(),
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
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
    if (this.guests.adultCount === 0) {
      return;
    }
    let currentDomain = window.location.hostname;
    let subdomainURL = `bookingdirect.com`;
    if (currentDomain === 'localhost') {
      currentDomain = `localhost:7742`;
    } else {
      currentDomain = `${subdomainURL}`;
    }

    const { from_date, to_date } = this.dates;
    const { adultCount, childrenCount } = this.guests;
    const fromDate = from_date ? `checkin=${format(from_date, 'yyyy-MM-dd')}` : '';
    const toDate = from_date ? `checkout=${format(to_date, 'yyyy-MM-dd')}` : '';
    const adults = adultCount > 0 ? `adults=${adultCount}` : '';
    const children = childrenCount > 0 ? `children=${childrenCount}` : '';
    const roomTypeId = this.roomTypeId ? `rtid=${this.roomTypeId}` : '';
    const queryParams = [fromDate, toDate, adults, children, roomTypeId];
    const queryString = queryParams.filter(param => param !== '').join('&');
    window.open(`http://${currentDomain}?${queryString}`, '_blank');
  }

  private renderDateTrigger() {
    return (
      <div class="date-trigger" slot="trigger">
        <ir-icons name="calendar" svgClassName="size-4"></ir-icons>
        {this.dates && this.dates.from_date && this.dates.to_date ? (
          <div>
            <p>
              <span>{format(this.dates.from_date, 'MMM dd')}</span>
              <span> - </span>
              <span>{format(this.dates.to_date, 'MMM dd')}</span>
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
          {adultCount > 0 && (
            <span>
              {adultCount} {adultCount === 1 ? localizedWords.entries.Lcz_Adult : localizedWords.entries.Lcz_Adults}
            </span>
          )}
          {childrenCount > 0 && (
            <span>
              , {childrenCount} {childrenCount === 1 ? localizedWords.entries.Lcz_Child : localizedWords.entries.Lcz_Children}
            </span>
          )}
          {adultCount === 0 && <span>Guests</span>}
        </p>
      </div>
    );
  }

  render() {
    if (this.isLoading) {
      return null;
    }
    return (
      <Fragment>
        <div class="booking-widget-container" style={this.contentContainerStyle}>
          <ir-popover
            class={'ir-popover'}
            showCloseButton={false}
            placement="auto"
            ref={el => (this.popover = el)}
            onOpenChange={e => {
              this.isPopoverOpen = e.detail;
              if (!this.isPopoverOpen) {
                if (!this.dates.to_date && this.dates.from_date) {
                  this.dates = {
                    ...this.dates,
                    to_date: addDays(this.dates.from_date, 1),
                  };
                }
              }
            }}
          >
            {this.renderDateTrigger()}
            <div slot="popover-content" class="popup-container w-full border-0 bg-white p-4 pb-6 shadow-none sm:w-auto sm:border sm:p-4 sm:shadow-sm md:p-6 ">
              <ir-date-range
                minDate={addDays(new Date(), -1)}
                style={{ '--radius': 'var(--ir-widget-radius)' }}
                fromDate={this.dates?.from_date}
                toDate={this.dates?.to_date}
                locale={localization_store.selectedLocale}
                maxSpanDays={5}
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
          <ir-popover ref={el => (this.guestPopover = el)} class={'ir-popover'} showCloseButton={false} placement="auto">
            {this.renderAdultChildTrigger()}

            <ir-guest-counter
              slot="popover-content"
              minAdultCount={0}
              maxAdultCount={app_store?.property?.adult_child_constraints.adult_max_nbr}
              maxChildrenCount={app_store?.property?.adult_child_constraints.child_max_nbr}
              childMaxAge={app_store.property?.adult_child_constraints.child_max_age}
              onUpdateCounts={e => (this.guests = e.detail)}
              class={'h-full'}
              onCloseGuestCounter={() => this.guestPopover.toggleVisibility()}
            ></ir-guest-counter>
          </ir-popover>
          <button class="btn-flip" onClick={this.handleBooknow.bind(this)} data-back="Book now" data-front="Book now"></button>
        </div>
      </Fragment>
    );
  }
}
