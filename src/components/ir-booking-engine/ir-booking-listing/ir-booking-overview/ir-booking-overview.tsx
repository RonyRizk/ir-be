import { Component, Host, Listen, Prop, State, h, Event, EventEmitter, Fragment } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
import { BookingListingService } from '@/services/api/booking_listing.service';
import { CommonService } from '@/services/api/common.service';
import { PropertyService } from '@/services/api/property.service';
import { BookingListingAppService } from '@/services/app/booking-listing.service';
import { cn, formatAmount, formatFullLocation, runScriptAndRemove } from '@/utils/utils';
import { differenceInCalendarDays } from 'date-fns';
import app_store from '@/stores/app.store';
import { PaymentService } from '@/services/api/payment.service';
import localizedWords from '@/stores/localization.store';
import moment from 'moment/min/moment-with-locales';
@Component({
  tag: 'ir-booking-overview',
  styleUrl: 'ir-booking-overview.css',
  scoped: true,
})
export class IrBookingOverview {
  @Prop() propertyid: number;
  @Prop() language: string;
  @Prop() maxPages: number = 10;
  @Prop() showAllBookings: boolean = true;
  @Prop() be: boolean = false;
  @Prop() aff: boolean = false;

  @State() isLoading = false;
  @State() bookings: Booking[] = [];
  @State() currentPage = 1;
  @State() total_count = 1;
  @State() bookingNumber = null;
  @State() page_mode: 'single' | 'multi' = 'multi';
  @State() activeLink: 'single_booking' | 'all_booking' = 'single_booking';
  @State() selectedBooking: Booking | null;
  @State() selectedMenuIds: Record<string, number> = {};
  @State() hoveredBooking = null;
  @State() cancellationMessage: string;
  @State() amountToBePayed: number;

  @Event() bl_routing: EventEmitter<{
    route: 'booking' | 'booking-details';
    params?: unknown;
  }>;

  private bookingListingService = new BookingListingService();
  private commonService = new CommonService();
  private propertyService = new PropertyService();
  private bookingListingAppService = new BookingListingAppService();
  private paymentService = new PaymentService();

  private booking: Booking;
  private bookingCancellation: HTMLIrBookingCancellationElement;
  async componentWillLoad() {
    if (!this.propertyid) {
      throw new Error('missing property id');
    }
    this.initializeServices();
    this.initializeApp();
  }
  initializeServices() {
    if (!this.showAllBookings) {
      this.page_mode = 'multi';
    }
  }
  async initializeApp() {
    try {
      this.isLoading = true;
      let requests = [];
      if (this.bookingNumber && this.page_mode === 'single') {
        requests.unshift(this.propertyService.getExposedBooking({ booking_nbr: this.bookingNumber, language: this.language, currency: null }, false));
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
      const { bookings, total_count } = await this.bookingListingService.getExposedGuestBookings({
        property_id: this.propertyid,
        start_row,
        end_row,
        total_count: 0,
        language: app_store.userPreferences.language_id,
      });
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
  private async fetchBooking(booking_nbr: string) {
    return await this.propertyService.getExposedBooking({ booking_nbr, language: this.language || app_store.userPreferences.language_id, currency: null }, true);
  }
  private async modifyCancelBooking(booking_nbr: string) {
    const bookings = [...this.bookings];
    const selectedBookingIdx = bookings.findIndex(b => b.booking_nbr === booking_nbr);
    if (selectedBookingIdx === -1) {
      return;
    }
    const newBooking = await this.fetchBooking(bookings[selectedBookingIdx].booking_nbr.toString());
    bookings[selectedBookingIdx] = {
      ...newBooking,
    };
    this.bookings = [...bookings];
  }
  getBadgeVariant(booking: Booking) {
    const { code } = booking.status;
    if (booking.is_requested_to_cancel || code === '003') {
      return 'error';
    }
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
  @Listen('languageChanged', { target: 'body' })
  async handleLanguageChanged(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const [bookings] = await Promise.all([
      this.getBookings(),
      this.commonService.getExposedLanguage(),
      this.propertyService.getExposedProperty({
        id: app_store.app_data.property_id,
        language: e.detail,
        aname: app_store.app_data.aName,
        perma_link: app_store.app_data.perma_link,
      }),
    ]);
    this.bookings = bookings;
  }
  private handleBookingCancellation() {
    setTimeout(() => {
      this.bookingCancellation.openDialog();
    }, 10);
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
        return this.processPayment();
      case 3:
        return this.handleBookingCancellation();
      default:
        return null;
    }
  }
  private async processPayment() {
    const paymentCode = this.selectedBooking.extras.find(e => e.key === 'payment_code');
    if (!paymentCode) {
      console.error('missing paymentcode');
      return;
    }
    const prePaymentAmount = this.selectedBooking.extras.find(e => e.key === 'prepayment_amount');
    if (!prePaymentAmount) {
      console.error('missing prepayment amount');
      return;
    }
    const paymentMethod = app_store.property.allowed_payment_methods.find(apm => apm.code === paymentCode.value);
    if (!paymentMethod) {
      console.error('Invalid payment method');
      return;
    }
    // const { amount } = await this.paymentService.GetExposedApplicablePolicies({
    //   book_date: new Date(this.selectedBooking.booked_on.date),
    //   token: app_store.app_data.token,
    //   params: {
    //     booking_nbr: this.selectedBooking.booking_nbr,
    //     property_id: app_store.app_data.property_id,
    //     room_type_id: 0,
    //     rate_plan_id: 0,
    //     currency_id: this.selectedBooking.currency.id,
    //     language: app_store.userPreferences.language_id,
    //   },
    // });
    const { amount } = await this.paymentService.getBookingPrepaymentAmount(this.selectedBooking);
    if (amount || Number(prePaymentAmount.value) > 0) {
      await this.paymentService.GeneratePaymentCaller({
        token: app_store.app_data.token,
        params: {
          booking_nbr: this.selectedBooking.booking_nbr,
          amount: Number(amount || prePaymentAmount.value) ?? 0,
          currency_id: this.selectedBooking.currency.id,
          email: this.selectedBooking.guest.email,
          pgw_id: paymentMethod.id.toString(),
        },
        onRedirect: url => (window.location.href = url),
        onScriptRun: script => runScriptAndRemove(script),
      });
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
        <div class="flex h-screen w-full flex-col place-content-center">
          <div class=" flex h-screen flex-col gap-4 md:hidden">
            {[...Array(5)].map((_, idx) => (
              <ir-skeleton key={idx} class="h-80 w-full"></ir-skeleton>
            ))}
          </div>
          <div class="hidden h-screen flex-col md:flex">
            <ir-skeleton class="h-[80vh] w-full"></ir-skeleton>
          </div>
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
                    <th class="ir-table-head capitalize">{localizedWords.entries.Lcz_status}</th>
                    <th class="ir-table-head">{localizedWords.entries.Lcz_BookingReference}</th>
                    <th class="ir-table-head md:hidden lg:table-cell">{localizedWords.entries.Lcz_BookingDate}</th>
                    <th class="ir-table-head">{localizedWords.entries.Lcz_CheckIn}</th>
                    <th class="ir-table-head">{localizedWords.entries.Lcz_Duration}</th>
                    <th class="ir-table-head">{localizedWords.entries.Lcz_Totalprice}</th>
                    <th class="ir-table-head sr-only">pay now</th>
                  </tr>
                </thead>
                <tbody class=" ">
                  {this.bookings?.map(booking => {
                    const totalNights = differenceInCalendarDays(new Date(booking.to_date), new Date(booking.from_date));
                    const { cancel, payment, view } = this.bookingListingAppService.getBookingActions(booking);
                    const menuItems = [];
                    if (payment.show) {
                      const prepayment_amount = booking.extras.find(e => e.key === 'prepayment_amount');
                      if (prepayment_amount) {
                        menuItems.push({ id: 2, item: payment.label });
                      }
                    }
                    if (cancel.show) {
                      menuItems.push({ id: 3, item: cancel.label });
                    }
                    if (view.show) {
                      menuItems.push({ id: 1, item: view.label });
                    }
                    this.selectedMenuIds[booking.booking_nbr] = menuItems[0]?.id;
                    return (
                      <Fragment>
                        {this.aff && (
                          <tr
                            class="ir-table-row group-hover"
                            onMouseEnter={() => {
                              this.hoveredBooking = booking.booking_nbr;
                            }}
                            onMouseLeave={() => (this.hoveredBooking = null)}
                            key={booking.booking_nbr}
                            data-state={this.hoveredBooking === booking.booking_nbr ? 'hovered' : ''}
                          >
                            <th class="ir-table-cell" data-state="affiliate" colSpan={7}>
                              {booking.property.name} <span class={'property-location'}>{formatFullLocation(booking.property)}</span>
                            </th>
                          </tr>
                        )}
                        <tr
                          class="ir-table-row group-hover"
                          onMouseEnter={() => {
                            this.hoveredBooking = booking.booking_nbr;
                          }}
                          onMouseLeave={() => (this.hoveredBooking = null)}
                          key={booking.booking_nbr}
                          data-state={this.hoveredBooking === booking.booking_nbr ? 'hovered' : ''}
                        >
                          <td class="ir-table-cell" data-state={this.aff ? 'booking-affiliate' : ''}>
                            {
                              <ir-badge
                                label={booking?.is_requested_to_cancel ? localizedWords.entries.Lcz_Cancellation_Requested : booking.status.description}
                                variant={this.getBadgeVariant(booking)}
                              ></ir-badge>
                            }
                          </td>
                          <td class="ir-table-cell" data-state={this.aff ? 'booking-affiliate' : ''}>
                            {booking.booking_nbr}
                          </td>
                          <td class="ir-table-cell text-start  md:hidden lg:table-cell" data-state={this.aff ? 'booking-affiliate' : ''}>
                            {moment(booking.booked_on.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}
                          </td>
                          <td class="ir-table-cell" data-state={this.aff ? 'booking-affiliate' : ''}>
                            {moment(booking.from_date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}
                          </td>
                          <td class="ir-table-cell lowercase" data-state={this.aff ? 'booking-affiliate' : ''}>
                            {totalNights} {totalNights > 1 ? localizedWords.entries.Lcz_Nights : localizedWords.entries.Lcz_night}
                          </td>
                          <td class="ir-table-cell" data-state={this.aff ? 'booking-affiliate' : ''}>
                            {formatAmount(booking.total, booking.currency.code)}
                          </td>
                          <td class="ir-table-cell" data-state={this.aff ? 'booking-affiliate' : ''}>
                            {payment.show || cancel.show ? (
                              <div class={'ct-menu-container'}>
                                <button
                                  onClick={() => {
                                    this.selectedBooking = booking;
                                    this.handleBlEvents(this.selectedMenuIds[booking.booking_nbr] ?? menuItems[0].id);
                                  }}
                                  class="ct-menu-button"
                                >
                                  {menuItems.find(p => p.id === this.selectedMenuIds[booking.booking_nbr])?.item}
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
                              view.show && (
                                <button
                                  class="booking-details-btn"
                                  onClick={() => {
                                    this.bl_routing.emit({
                                      route: 'booking-details',
                                      params: {
                                        booking,
                                      },
                                    });
                                  }}
                                >
                                  {localizedWords.entries.Lcz_BookingDetails}
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      </Fragment>
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
                aff={this.aff}
                booking={booking}
                key={booking.booking_nbr}
                onOptionClicked={(e: CustomEvent) => {
                  this.selectedBooking = booking;
                  const { id } = e.detail;
                  this.handleBlEvents(id);
                }}
              ></ir-booking-card>
            ))}
            {this.page_mode === 'multi' && <ir-pagination total={totalPages} current={this.currentPage}></ir-pagination>}
          </section>

          <ir-booking-cancellation
            ref={el => (this.bookingCancellation = el)}
            booking={this.selectedBooking}
            onCancellationResult={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              const { state, booking_nbr } = e.detail;
              if (state === 'success') {
                this.modifyCancelBooking(booking_nbr);
              }
            }}
          ></ir-booking-cancellation>
        </section>
      </Host>
    );
  }
}
