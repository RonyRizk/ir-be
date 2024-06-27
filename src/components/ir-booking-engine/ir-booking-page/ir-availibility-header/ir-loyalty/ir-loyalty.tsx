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
    this.resetBooking.emit('discountOnly');
  }
  render() {
    const show_loyalty = app_store.property?.promotions?.some(p => p.is_loyalty);
    if (!show_loyalty || booking_store.bookingAvailabilityParams.coupon) {
      return null;
    }

    return (
      <Host>
        <div class="flex w-full items-center justify-center gap-4">
          <ir-button
            class={cn('w-full', {
              'w-fit': booking_store.bookingAvailabilityParams.loyalty,
            })}
            onButtonClick={() => this.toggleLoyalty(true)}
            variants="outline"
            label={localizedWords.entries.Lcz_GetLoyaltyDiscount}
            haveLeftIcon
          >
            <ir-icons slot="left-icon" name="heart"></ir-icons>
          </ir-button>
          {booking_store.bookingAvailabilityParams.loyalty && (
            <div class="flex items-center  text-sm text-[hsl(var(--brand-600))]">
              <p onClick={() => this.toggleLoyalty(false)}>{localizedWords.entries.Lcz_LoyaltyApplied}</p>
              <ir-button aria-label={'remove loyalty'} variants="icon" iconName="xmark" svgClassName="text-[hsl(var(--brand-600))]" onButtonClick={() => this.toggleLoyalty(false)}>
                {/* <ir-icons title="remove loyalty" slot="btn-icon"  ></ir-icons> */}
              </ir-button>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
