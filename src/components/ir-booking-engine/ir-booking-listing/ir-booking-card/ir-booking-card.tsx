import { Booking } from '@/models/booking.dto';
import { BookingListingAppService } from '@/services/app/booking-listing.service';
import localizedWords from '@/stores/localization.store';
import { formatAmount, formatFullLocation } from '@/utils/utils';
import { Component, Event, EventEmitter, Prop, Watch, h } from '@stencil/core';
import { differenceInCalendarDays, format } from 'date-fns';

@Component({
  tag: 'ir-booking-card',
  styleUrl: 'ir-booking-card.css',
  shadow: true,
})
export class IrBookingCard {
  @Prop() booking: Booking;
  @Prop() aff: boolean = false;

  @Event() optionClicked: EventEmitter<{ tag: string; id: number }>;

  private totalNights: number;
  private bookingListingAppService = new BookingListingAppService();

  componentWillLoad() {
    if (!this.booking) {
      return;
    }
    this.init();
  }
  @Watch('booking')
  handleBookingChange(newValue) {
    if (newValue) {
      this.init();
    }
  }
  getBadgeVariant(code: string) {
    if (code === '001') {
      return 'pending';
    } else if (code === '002') {
      return 'success';
    }
    return 'error';
  }

  private init() {
    this.totalNights = differenceInCalendarDays(new Date(this.booking.to_date), new Date(this.booking.from_date));
  }

  render() {
    const { cancel, payment, view } = this.bookingListingAppService.getBookingActions(this.booking);
    return (
      <div class="relative flex flex-col space-y-1.5 rounded-xl  bg-gray-100 p-6 text-sm " key={this.booking.booking_nbr}>
        {this.aff && (
          <div class="">
            <span class="font-medium">{this.booking.property.name}</span>
            <span class="mx-2 text-xs text-gray-700">{formatFullLocation(this.booking.property)}</span>
          </div>
        )}
        <div class="flex items-center justify-between text-base">
          <h3 class=" font-semibold leading-none tracking-tight">
            {localizedWords.entries.Lcz_BookingReference}: {this.booking.booking_nbr}
          </h3>
          <p class={'font-semibold'}>{formatAmount(this.booking.total, this.booking.currency.code)}</p>
        </div>
        <p>
          <span class="font-medium">{localizedWords.entries.Lcz_BookedOn}: </span>
          {format(new Date(this.booking.booked_on.date), 'dd-MMM-yyyy')}
        </p>
        <p>
          <span class="font-medium">{localizedWords.entries.Lcz_CheckIn}: </span>
          {format(new Date(this.booking.from_date), 'EEE, dd MMM yyyy')}
        </p>
        <p>
          <span class="font-medium">{localizedWords.entries.Lcz_Duration}: </span>
          {this.totalNights} {this.totalNights > 1 ? 'nights' : 'night'}
        </p>
        <p class="flex items-center">
          {<ir-badge backgroundShown={false} label={this.booking.status.description} variant={this.getBadgeVariant(this.booking.status.code)}></ir-badge>}
        </p>

        {(view.show || payment.show || cancel.show) && (
          <div class="mt-2.5 flex flex-col items-center justify-end gap-2.5 pt-2">
            {payment.show && <ir-button class={'w-full'} label={payment.label} onButtonClick={() => this.optionClicked.emit({ tag: 'pay', id: 2 })}></ir-button>}
            {cancel.show && <ir-button class="w-full" variants="outline" label={cancel.label} onButtonClick={() => this.optionClicked.emit({ tag: 'cancel', id: 3 })}></ir-button>}
            {view.show && <ir-button class="w-full" variants="outline" label={view.label} onButtonClick={() => this.optionClicked.emit({ tag: 'view', id: 1 })}></ir-button>}
          </div>
        )}
      </div>
    );
  }
}
