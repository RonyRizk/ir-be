import app_store from '@/stores/app.store';
import booking_store, { modifyBookingStore } from '@/stores/booking';
import localizedWords from '@/stores/localization.store';
import { cn } from '@/utils/utils';
import { Component, Host, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'ir-loyalty',
  styleUrl: 'ir-loyalty.css',
  shadow: true,
})
export class IrLoyalty {
  @Event({ bubbles: true, composed: true }) resetBooking: EventEmitter<string>;
  toggleLoyalty(value: boolean) {
    modifyBookingStore('bookingAvailabilityParams', {
      ...booking_store.bookingAvailabilityParams,
      coupon: null,
      loyalty: value,
    });
    this.resetBooking.emit('partialReset');
  }
  render() {
    const show_loyalty = app_store.property?.promotions?.some(p => p.is_loyalty);
    if (!show_loyalty || booking_store.bookingAvailabilityParams.coupon) {
      return null;
    }
    if (booking_store.bookingAvailabilityParams.loyalty) {
      return (
        <div class="flex items-center  text-sm text-[hsl(var(--brand-600))]">
          <p onClick={() => this.toggleLoyalty(false)}>{localizedWords.entries.Lcz_LoyaltyApplied}</p>
          <ir-button
            aria-label={'remove loyalty'}
            variants="icon"
            iconName="xmark"
            svgClassName="text-[hsl(var(--brand-600))]"
            onButtonClick={() => this.toggleLoyalty(false)}
          ></ir-button>
        </div>
      );
    }
    return (
      <Host>
        <ir-button class={cn('w-full')} onButtonClick={() => this.toggleLoyalty(true)} variants="outline" label={localizedWords.entries.Lcz_GetLoyaltyDiscount} haveLeftIcon>
          <ir-icons slot="left-icon" name="heart"></ir-icons>
        </ir-button>
      </Host>
    );
  }
}
