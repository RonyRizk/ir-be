import { Component, Event, EventEmitter, Host, Listen, Prop, State, h } from '@stencil/core';
import { Locale } from 'date-fns';
import { IExposedProperty } from '@/models/property';
import booking_store, { calculateTotalCost } from '@/stores/booking';
import app_store, { onAppDataChange } from '@/stores/app.store';
import { cn, formatAmount, getDateDifference } from '@/utils/utils';
import localizedWords from '@/stores/localization.store';
import { ICurrency, IExposedLanguages, pages } from '@/models/common';
import { isRequestPending } from '@/stores/ir-interceptor.store';
@Component({
  tag: 'ir-booking-page',
  styleUrl: 'ir-booking-page.css',
  shadow: true,
})
export class IrBookingPage {
  @Prop() fromDate: string;
  @Prop() toDate: string;
  @Prop() adultCount: string;
  @Prop() ages: string;
  @Prop() childrenCount: string;

  @State() selectedLocale: Locale;
  @State() property: IExposedProperty;
  @State() currencies: ICurrency[];
  @State() languages: IExposedLanguages[];

  @Event() routing: EventEmitter<pages>;

  private checkoutContainerRef: HTMLDivElement;
  roomTypeSectionRef: HTMLElement;
  private availabilityHeaderRef: HTMLIrAvailabilityHeaderElement;
  propertyGalleryRef: HTMLDivElement;

  componentWillLoad() {
    this.property = { ...app_store.property };
    onAppDataChange('property', (newValue: IExposedProperty) => {
      this.property = { ...newValue };
    });
  }

  @Listen('animateBookingButton')
  handleBookingAnimation(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (this.checkoutContainerRef) {
      this.checkoutContainerRef.classList.add('bounce-twice');
      this.checkoutContainerRef.addEventListener('animationend', () => {
        this.checkoutContainerRef.classList.remove('bounce-twice');
      });
    }
  }

  // @Listen('scrollToRoomType')
  // handleScrolling(e: CustomEvent) {
  //   e.stopImmediatePropagation();
  //   e.stopPropagation();
  //   const header: HTMLIrNavElement | null = document.querySelector('ir-be').shadowRoot.querySelector('ir-nav');
  //   this.availabilityHeaderRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //   setTimeout(() => {
  //     window.scrollTo({
  //       top: this.availabilityHeaderRef.getBoundingClientRect().top + window.scrollY - (header !== null ? header.getBoundingClientRect().height + 5 : 80),
  //       behavior: 'smooth',
  //     });
  //   }, 100);
  // }
  @Listen('scrollToRoomType')
  handleScrolling(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const header: HTMLIrNavElement | null = document.querySelector('ir-be')?.shadowRoot.querySelector('ir-nav');

    if (this.availabilityHeaderRef) {
      const headerHeight = header?.getBoundingClientRect().height || 0;
      const targetPosition = this.availabilityHeaderRef.getBoundingClientRect().top + window.scrollY - (headerHeight + 5);
      const currentPosition = window.scrollY;
      const tolerance = 10;
      console.log(currentPosition, targetPosition);

      if (currentPosition === 0 || Math.abs(currentPosition - targetPosition) > tolerance) {
        this.availabilityHeaderRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          window.scrollTo({
            top: this.availabilityHeaderRef.getBoundingClientRect().top + window.scrollY - (header !== null ? header.getBoundingClientRect().height + 5 : 80),
            behavior: 'smooth',
          });
        }, 100);
      }
    }
  }
  private renderTotalNights() {
    const diff = getDateDifference(booking_store.bookingAvailabilityParams.from_date ?? new Date(), booking_store.bookingAvailabilityParams.to_date ?? new Date());
    return `${diff} ${diff > 1 ? localizedWords.entries.Lcz_Nights : localizedWords.entries.Lcz_night}`;
  }
  // private checkMaxAmount() {
  //   if (!booking_store.enableBooking) {
  //     return;
  //   }
  //   return booking_store.roomTypes.some(rt => {
  //     return rt?.rateplans.some(rp =>
  //       rp?.variations.some(v => {
  //         console.log(v.total_before_discount); // Debugging line
  //         return v.total_before_discount.toString().length > 8;
  //       }),
  //     );
  //   });
  // }
  render() {
    if (!this.property) {
      return null;
    }
    // console.log(this.checkMaxAmount());
    const { totalAmount } = calculateTotalCost();
    const isInjected = app_store.app_data.injected;
    return (
      <Host>
        <div class="space-y-5 ">
          {!isInjected && (
            <div ref={el => (this.propertyGalleryRef = el)}>
              <ir-property-gallery></ir-property-gallery>
            </div>
          )}
          <div>
            <ir-availability-header
              ages={this.ages}
              ref={el => (this.availabilityHeaderRef = el)}
              fromDate={this.fromDate}
              toDate={this.toDate}
              adultCount={this.adultCount}
              childrenCount={this.childrenCount}
            ></ir-availability-header>
          </div>

          <section class={app_store.app_data.displayMode === 'default' ? 'relative justify-between gap-4 rounded-md ' : ''} ref={el => (this.roomTypeSectionRef = el)}>
            <div class={app_store.app_data.displayMode === 'default' ? ' flex-1 py-2' : 'grid-container'}>
              {booking_store.roomTypes?.map(roomType => {
                if (
                  !roomType.is_active ||
                  (app_store.app_data.roomtype_id && roomType.id !== app_store.app_data.roomtype_id) ||
                  !roomType.rateplans.some(rp => rp.is_booking_engine_enabled) ||
                  (!!booking_store.bookingAvailabilityParams.agent && roomType.rateplans.filter(rp => rp.is_targeting_travel_agency).length === 0)
                ) {
                  return null;
                }
                return <ir-roomtype display={app_store.app_data.displayMode} roomtype={roomType} key={roomType.id}></ir-roomtype>;
              })}
            </div>
          </section>
          <section class={cn('text-sm', { 'pb-5': isInjected })}>
            <h2 class="mb-5 text-lg font-medium">{localizedWords.entries.Lcz_FacilitiesAndServices}</h2>
            <ir-facilities></ir-facilities>
            {!isInjected && <p innerHTML={this.property?.description?.location_and_intro} class="px-6 py-8"></p>}
          </section>
        </div>
        {booking_store.enableBooking && totalAmount > 0 && (
          <div
            ref={el => (this.checkoutContainerRef = el)}
            class="sticky bottom-2 z-40 mt-14 flex w-full items-center justify-end gap-4 rounded-md bg-gray-700/80 text-base text-gray-200 md:text-lg lg:gap-10  lg:text-2xl"
          >
            <p>{this.renderTotalNights()}</p>
            {totalAmount > 0 && <div>{formatAmount(totalAmount, app_store.userPreferences.currency_id, 0)}</div>}
            <ir-button
              onButtonClick={() => this.routing.emit('checkout')}
              label={localizedWords.entries.Lcz_BookNow}
              size="lg"
              class="w-auto lg:w-60"
              disabled={isRequestPending('/Check_Availability')}
              buttonStyles={{
                height: '64px',
                borderRadius: '0',
                borderTopRightRadius: app_store.dir === 'RTL' ? '0px' : '6px',
                borderBottomRightRadius: app_store.dir === 'RTL' ? '0px' : '6px',
                borderTopLeftRadius: app_store.dir === 'RTL' ? '6px' : '0px',
                borderBottomLeftRadius: app_store.dir === 'RTL' ? '6px' : '0px',
              }}
            ></ir-button>
          </div>
        )}
      </Host>
    );
  }
}
