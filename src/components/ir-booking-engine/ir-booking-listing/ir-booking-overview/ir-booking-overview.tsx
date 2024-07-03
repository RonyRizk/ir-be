import { Component, Host, Listen, Prop, State, h, Event, EventEmitter } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
import { BookingListingService } from '@/services/api/booking_listing.service';
import { CommonService } from '@/services/api/common.service';
import { PropertyService } from '@/services/api/property.service';
import { BookingListingAppService } from '@/services/app/booking-listing.service';
import { cn, formatAmount } from '@/utils/utils';
import { differenceInCalendarDays, format } from 'date-fns';

@Component({
  tag: 'ir-booking-overview',
  styleUrl: 'ir-booking-overview.css',
  scoped: true,
})
export class IrBookingOverview {
  @Prop() token: string;
  @Prop() propertyid: number;
  @Prop() language: string;
  @Prop() maxPages: number = 10;
  @Prop() showAllBookings: boolean = true;
  @Prop() be: boolean = false;

  @State() isLoading = false;
  @State() bookings: Booking[] = [];
  @State() currentPage = 1;
  @State() total_count = 1;
  @State() bookingNumber = null;
  @State() page_mode: 'single' | 'multi' = 'multi';
  @State() activeLink: 'single_booking' | 'all_booking' = 'single_booking';
  @State() selectedBooking: Booking | null;
  @State() selectedMenuIds: Record<string, number> = {};

  @Event() bl_routing: EventEmitter<{
    route: 'booking' | 'booking-details';
    params?: unknown;
  }>;

  private bookingListingService = new BookingListingService();
  private commonService = new CommonService();
  private propertyService = new PropertyService();
  private bookingListingAppService = new BookingListingAppService();

  private booking: Booking;
  private bookingCancelation: HTMLIrBookingCancelationElement;
  async componentWillLoad() {
    if (!this.propertyid) {
      throw new Error('missing property id');
    }
    this.initializeServices();
    this.initializeApp();
  }
  initializeServices() {
    this.bookingListingService.setToken(this.token);
    this.propertyService.setToken(this.token);
    this.commonService.setToken(this.token);
    if (!this.showAllBookings) {
      this.page_mode = 'multi';
    }
  }
  async initializeApp() {
    try {
      this.isLoading = true;
      let requests = [];
      if (this.bookingNumber && this.page_mode === 'single') {
        requests.unshift(this.propertyService.getExposedBooking({ booking_nbr: this.bookingNumber, language: this.language }, false));
      } else if (this.page_mode === 'multi') {
        requests.unshift(this.getBookings());
      }
      const [bookings] = await Promise.all(requests);
      this.booking = this.page_mode === 'single' ? bookings : undefined;
      this.bookings = this.page_mode === 'single' ? [bookings] : bookings;
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  async getBookings() {
    try {
      this.isLoading = true;
      const start_row = (this.currentPage - 1) * this.maxPages;
      const end_row = start_row + this.maxPages;
      const { bookings, total_count } = await this.bookingListingService.getExposedGuestBookings({ property_id: this.propertyid, start_row, end_row, total_count: 0 });
      this.total_count = total_count;
      const newIds = {};
      bookings.forEach(b => {
        newIds[b.booking_nbr] = 1;
      });
      this.selectedMenuIds = { ...newIds };

      return bookings;
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  modifyCancelBooking(booking_nbr: string) {
    const bookings = [...this.bookings];
    const selectedBookingIdx = bookings.findIndex(b => b.booking_nbr === booking_nbr);
    if (selectedBookingIdx === -1) {
      return;
    }
    bookings[selectedBookingIdx] = {
      ...bookings[selectedBookingIdx],
      status: {
        code: '003',
        description: 'Cancelled',
      },
    };
    this.bookings = [...bookings];
  }
  @Listen('authFinish')
  handleAuthFinish(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { token, state, payload } = e.detail;
    if (state === 'success') {
      if (payload.method === 'direct') {
        this.bookingNumber = payload.booking_nbr;
      }
      this.token = token;
      this.initializeServices();
      this.initializeApp();
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

  @Listen('pageChange')
  async handlePageChange(e: CustomEvent<number>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.currentPage = e.detail;
    this.bookings = await this.getBookings();
  }
  @Listen('linkChanged')
  async handleLinkChanged(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.activeLink = e.detail;
    if (this.activeLink === 'all_booking') {
      this.page_mode = 'multi';
      this.bookings = await this.getBookings();
    } else {
      if (this.booking) {
        this.page_mode = 'single';
        this.bookings = [this.booking];
      }
    }
  }
  private handleBookingCancelation() {
    this.bookingCancelation.openDialog();
  }
  private handleMenuItemChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const v = e.detail;
    this.handleBlEvents(v);
    this.selectedMenuIds[this.selectedBooking.booking_nbr] = v;
  }
  private handleBlEvents(id: number) {
    switch (id) {
      case 1:
        return this.bl_routing.emit({ route: 'booking-details', params: { booking: this.selectedBooking } });
      case 2:
        return;
      case 3:
        return this.handleBookingCancelation();
      default:
        return null;
    }
  }
  renderMenuTrigger() {
    return (
      <div slot="menu-trigger" class="ct-menu-trigger">
        {' '}
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z"
            fill="currentColor"
            fill-rule="evenodd"
            clip-rule="evenodd"
          ></path>
        </svg>
      </div>
    );
  }
  // private handlePayment() {

  // }
  render() {
    if (this.isLoading) {
      return (
        <div class="grid h-screen w-full place-content-center">
          <div class="page-loader"></div>
        </div>
      );
    }
    const totalPages = Math.round(this.total_count / this.maxPages);
    return (
      <Host>
        <section class={`main-container ${!this.be ? 'main-container-padding' : ''}`}>
          <div class="ir-table-container mx-auto hidden max-w-6xl flex-1 overflow-x-hidden p-4 shadow-md md:block">
            {this.showAllBookings && (
              <ir-booking-header bookingNumber={this.bookingNumber} activeLink={this.activeLink} mode={this.bookingNumber ? 'multi' : 'single'}></ir-booking-header>
            )}
            <div class="max-w-full overflow-x-auto">
              <table class="ir-table">
                <thead>
                  <tr class="ir-table-header">
                    <th class="ir-table-head">Status</th>
                    <th class="ir-table-head">Booking reference</th>
                    <th class="ir-table-head md:hidden lg:table-cell">Booking date</th>
                    <th class="ir-table-head">Check-in</th>
                    <th class="ir-table-head">Duration</th>
                    <th class="ir-table-head">Total price</th>
                    <th class="ir-table-head sr-only">pay now</th>
                  </tr>
                </thead>
                <tbody class=" ">
                  {this.bookings?.map(booking => {
                    const totalNights = differenceInCalendarDays(new Date(booking.to_date), new Date(booking.from_date));
                    const { cancel, payment, view } = this.bookingListingAppService.getBookingActions(booking);
                    const menuItems = [];
                    if (payment) {
                      menuItems.push({ id: 2, item: `Pay ${formatAmount(booking.financial.due_amount || 0, booking.currency.code)} to guarentee` });
                    }
                    if (cancel) {
                      menuItems.push({ id: 3, item: `Cancel booking` });
                    }
                    if (view) {
                      menuItems.push({ id: 1, item: 'Booking details' });
                    }
                    return (
                      <tr class="ir-table-row" key={booking.booking_nbr}>
                        <td class="ir-table-cell">{<ir-badge label={booking.status.description} variant={this.getBadgeVariant(booking.status.code)}></ir-badge>}</td>
                        <td class="ir-table-cell">{booking.booking_nbr}</td>
                        <td class="ir-table-cell md:hidden lg:table-cell">{format(new Date(booking.booked_on.date), 'dd-MMM-yyyy')}</td>
                        <td class="ir-table-cell">{format(new Date(booking.from_date), 'dd-MMM-yyyy')}</td>
                        <td class="ir-table-cell">
                          {totalNights} {totalNights > 1 ? 'nights' : 'night'}
                        </td>
                        <td class="ir-table-cell">{formatAmount(booking.total, booking.currency.code)}</td>
                        <td class="ir-table-cell">
                          {payment || cancel ? (
                            <div class={'ct-menu-container'}>
                              <button
                                onClick={() => {
                                  this.selectedBooking = booking;
                                  this.handleBlEvents(this.selectedMenuIds[booking.booking_nbr] ?? 1);
                                }}
                                class="ct-menu-button"
                              >
                                {menuItems.find(p => p.id === this.selectedMenuIds[booking.booking_nbr] ?? 1)?.item}
                              </button>
                              <ir-menu
                                onMenuItemClick={e => {
                                  this.selectedBooking = booking;
                                  this.handleMenuItemChange(e);
                                }}
                                data={menuItems}
                              >
                                {this.renderMenuTrigger()}
                              </ir-menu>
                            </div>
                          ) : (
                            view && (
                              <ir-button
                                variants="outline"
                                label="Booking details"
                                onButtonClick={() => {
                                  this.bl_routing.emit({
                                    route: 'booking-details',
                                    params: {
                                      booking,
                                    },
                                  });
                                }}
                              ></ir-button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {this.page_mode === 'multi' && (
              <div class="px-[1.25rem] pt-[1rem] ">
                <ir-pagination total={totalPages} current={this.currentPage}></ir-pagination>
              </div>
            )}
          </div>
          <section
            class={cn('flex-1 space-y-4  md:hidden', {
              'px-4': !this.be,
            })}
          >
            {this.showAllBookings && <ir-booking-header bookingNumber={this.bookingNumber} mode={this.bookingNumber ? 'multi' : 'single'}></ir-booking-header>}
            {this.bookings?.map(booking => (
              <ir-booking-card
                booking={booking}
                key={booking.booking_nbr}
                onOptionClicked={(e: CustomEvent) => {
                  this.selectedBooking = booking;
                  const { id } = e.detail;
                  console.log(id);
                  this.handleBlEvents(id);
                }}
              ></ir-booking-card>
            ))}
            {this.page_mode === 'multi' && <ir-pagination total={totalPages} current={this.currentPage}></ir-pagination>}
          </section>

          <ir-booking-cancelation
            ref={el => (this.bookingCancelation = el)}
            booking_nbr={this.selectedBooking?.booking_nbr}
            cancelation={this.selectedBooking?.rooms[0].rateplan.cancelation}
            onCancelationResult={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              const { state, booking_nbr } = e.detail;
              if (state === 'success') {
                this.modifyCancelBooking(booking_nbr);
              }
            }}
          ></ir-booking-cancelation>
        </section>
      </Host>
    );
  }
}
