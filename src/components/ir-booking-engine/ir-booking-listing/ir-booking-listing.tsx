import { Booking } from '@/models/booking.dto';
import { BookingListingService } from '@/services/api/booking_listing.service';
import { CommonService } from '@/services/api/common.service';
import { PropertyService } from '@/services/api/property.service';
import { BookingListingAppService } from '@/services/app/booking-listing.service';
import app_store from '@/stores/app.store';
import { formatAmount, getUserPrefernce } from '@/utils/utils';
import { Component, Host, Listen, Prop, State, h } from '@stencil/core';
import axios from 'axios';
import { differenceInCalendarDays, format } from 'date-fns';

@Component({
  tag: 'ir-booking-listing',
  styleUrl: 'ir-booking-listing.css',
  scoped: false,
})
export class IrBookingListing {
  @Prop() propertyid: number;
  @Prop() baseUrl: string;
  @Prop() language: string;
  @Prop() headerShown: boolean = true;
  @Prop() footerShown: boolean = true;
  @Prop() maxPages: number = 10;
  @Prop() perma_link: string = null;
  @Prop() aName: string = null;

  @State() isLoading = false;
  @State() token: string;
  @State() bookings: Booking[] = [];
  @State() currentPage = 1;
  @State() total_count = 1;
  @State() bookingNumber = null;
  @State() page_mode: 'single' | 'multi' = 'multi';
  @State() activeLink: 'single_booking' | 'all_booking' = 'single_booking';

  private bookingListingService = new BookingListingService();
  private commonService = new CommonService();
  private propertyService = new PropertyService();
  private bookingListingAppService = new BookingListingAppService();

  private booking: Booking;
  async componentWillLoad() {
    axios.defaults.baseURL = this.baseUrl;
    if (!this.propertyid) {
      throw new Error('missing property id');
    }
    getUserPrefernce();
    const isAuthenticated = this.commonService.checkUserAuthState();
    if (isAuthenticated) {
      this.bookingNumber = isAuthenticated.params ? isAuthenticated.params.booking_nbr : null;
      this.token = isAuthenticated.token;
      this.page_mode = isAuthenticated.params ? 'single' : 'multi';
      this.initializeServices();
      this.initializeApp();
    } else {
      const token = await this.commonService.getBEToken();
      if (token) {
        app_store.app_data.token = token;
      }
      // this.initializeServices();
      // this.initializeApp();
    }
  }
  initializeServices() {
    this.bookingListingService.setToken(this.token);
    this.propertyService.setToken(this.token);
    this.commonService.setToken(this.token);
  }
  async initializeApp() {
    try {
      this.isLoading = true;
      let requests = [
        this.propertyService.getExposedProperty({
          id: this.propertyid,
          language: app_store.userPreferences?.language_id || 'en',
          aname: this.aName,
          perma_link: this.perma_link,
        }),

        this.commonService.getExposedLanguage(),
        this.propertyService.getExposedGuest(),
      ];
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
      const start_row = this.currentPage === 1 ? 0 : this.currentPage * this.maxPages;
      const end_row = start_row + this.maxPages;
      const { bookings, total_count } = await this.bookingListingService.getExposedGuestBookings({ property_id: this.propertyid, start_row, end_row, total_count: 0 });
      this.total_count = total_count;
      return bookings;
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
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
  render() {
    if (!this.token) {
      return (
        <Host>
          <main class="flex h-screen flex-col  justify-center">
            <div class="mx-auto w-full max-w-md px-4">
              {/* <ir-signin></ir-signin> */}
              <ir-auth enableSignUp={false}></ir-auth>
            </div>
          </main>
        </Host>
      );
    }
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
        <main class={'flex min-h-screen flex-col gap-4 md:px-4 lg:px-6 xl:px-0'}>
          {this.headerShown && (
            <ir-nav
              isBookingListing
              showBookingCode={false}
              showCurrency={false}
              website={app_store.property?.space_theme.website}
              logo={app_store.property?.space_theme?.logo}
            ></ir-nav>
          )}
          <div class="ir-table-container mx-auto hidden max-w-6xl flex-1 overflow-x-hidden px-4  shadow-md md:block">
            <ir-booking-header bookingNumber={this.bookingNumber} activeLink={this.activeLink} mode={this.bookingNumber ? 'multi' : 'single'}></ir-booking-header>
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
                <tbody>
                  {this.bookings?.map(booking => {
                    const totalNights = differenceInCalendarDays(new Date(booking.to_date), new Date(booking.from_date));
                    const { cancel, payment } = this.bookingListingAppService.getBookingActions(booking);
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
                          {/* <ir-menu data={menuItems}>
                            <ir-button slot="menu-trigger" variants="icon" iconHeight={16} iconWidth={16} removeIconClassName iconName="elipse_vertical"></ir-button>
                          </ir-menu> */}
                          {(payment || cancel) && (
                            <div class="flex items-center justify-end gap-2.5">
                              {cancel && <ir-button class="w-full" variants="outline" label="Cancel"></ir-button>}
                              {payment && <ir-button label={`Pay ${formatAmount(booking.financial.due_amount || 0, booking.currency.code)} to guarentee`}></ir-button>}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {this.page_mode === 'multi' && (
              <div class="px-[20px] py-[16px] ">
                <ir-pagination total={totalPages} current={this.currentPage}></ir-pagination>
              </div>
            )}
          </div>
          <section class={'flex-1 space-y-4 px-4 md:hidden'}>
            <ir-booking-header bookingNumber={this.bookingNumber} mode={this.bookingNumber ? 'multi' : 'single'}></ir-booking-header>
            {this.bookings?.map(booking => <ir-booking-card booking={booking} key={booking.booking_nbr}></ir-booking-card>)}
            {this.page_mode === 'multi' && <ir-pagination total={totalPages} current={this.currentPage}></ir-pagination>}
          </section>
          {this.footerShown && <ir-footer></ir-footer>}
        </main>
      </Host>
    );
  }
}
