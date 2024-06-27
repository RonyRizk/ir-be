import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-booking-header',
  styleUrl: 'ir-booking-header.css',
  shadow: true,
})
export class IrBookingHeader {
  @Prop() mode: 'single' | 'multi' = 'multi';
  @Prop() bookingNumber: number | null = null;
  @Prop() activeLink: 'single_booking' | 'all_booking' = 'single_booking';

  @Event() linkChanged: EventEmitter<'single_booking' | 'all_booking'>;
  handleButtonClick(link: 'single_booking' | 'all_booking') {
    this.linkChanged.emit(link);
  }
  render() {
    return (
      <Host>
        <div class="flex  items-center  justify-between gap-2.5 py-4">
          <h2 class="text-lg font-semibold leading-none tracking-tight">Bookings</h2>
          {this.mode === 'multi' && (
            <div class="flex items-center gap-2.5">
              <button
                type="button"
                class={`link leading-none tracking-tight ${this.activeLink === 'single_booking' ? 'active' : ''}`}
                onClick={() => this.handleButtonClick('single_booking')}
              >
                Booking #{this.bookingNumber}
              </button>
              <button
                type="button"
                class={`link leading-none tracking-tight ${this.activeLink === 'all_booking' ? 'active' : ''}`}
                onClick={() => this.handleButtonClick('all_booking')}
              >
                All Bookings
              </button>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
