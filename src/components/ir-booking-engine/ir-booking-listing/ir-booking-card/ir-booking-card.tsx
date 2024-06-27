import { Booking } from '@/models/booking.dto';
import { BookingListingAppService } from '@/services/app/booking-listing.service';
import { formatAmount } from '@/utils/utils';
import { Component, Event, EventEmitter, Prop, Watch, h } from '@stencil/core';
import { differenceInCalendarDays, format } from 'date-fns';

@Component({
  tag: 'ir-booking-card',
  styleUrl: 'ir-booking-card.css',
  shadow: true,
})
export class IrBookingCard {
  @Prop() booking: Booking;

  @Event() cardOptionClicked: EventEmitter<'cancel' | 'view' | 'pay'>;

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
    const { cancel, payment } = this.bookingListingAppService.getBookingActions(this.booking);
    return (
      <div class="relative flex flex-col space-y-1.5 rounded-xl  bg-gray-100 p-6 text-sm " key={this.booking.booking_nbr}>
        <div class="flex items-center justify-between text-base">
          <h3 class=" font-semibold leading-none tracking-tight">Booking: #{this.booking.booking_nbr}</h3>
          <p>{formatAmount(this.booking.total, this.booking.currency.code)}</p>
        </div>
        <p>
          <span class="font-medium">Booked on: </span>
          {format(new Date(this.booking.booked_on.date), 'dd-MMM-yyyy')}
        </p>
        <p>
          <span class="font-medium">Check-in: </span>
          {format(new Date(this.booking.from_date), 'EEE, dd MMM yyyy')}
        </p>
        <p>
          <span class="font-medium">Duration: </span>
          {this.totalNights} {this.totalNights > 1 ? 'nights' : 'night'}
        </p>
        <p class="flex items-center">
          <span class="font-medium">Status: </span>
          {<ir-badge backgroundShown={false} label={this.booking.status.description} variant={this.getBadgeVariant(this.booking.status.code)}></ir-badge>}
        </p>

        <div class="mt-2.5 flex flex-col items-center justify-end gap-2.5 pt-2">
          {payment && (
            <ir-button
              class={'w-full'}
              label={`Pay ${formatAmount(this.booking.financial.due_amount || 0, this.booking.currency.code)} to guarentee`}
              onButtonClick={() => this.cardOptionClicked.emit('pay')}
            ></ir-button>
          )}
          {cancel && <ir-button class="w-full" variants="outline" label="Cancel" onButtonClick={() => this.cardOptionClicked.emit('cancel')}></ir-button>}
          <ir-button class="w-full" variants="outline" label="View details" onButtonClick={() => this.cardOptionClicked.emit('view')}></ir-button>
        </div>
      </div>
    );
  }
}
