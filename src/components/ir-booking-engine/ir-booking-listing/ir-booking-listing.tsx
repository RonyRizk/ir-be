import { CommonService } from '@/services/api/common.service';
import { PropertyService } from '@/services/api/property.service';
import app_store from '@/stores/app.store';
import { getUserPrefernce } from '@/utils/utils';
import { Component, Host, Listen, Prop, State, h } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
import axios from 'axios';

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
  @Prop() showAllBookings: boolean = true;
  @Prop() be: boolean = false;

  @State() isLoading = false;
  @State() token: string;
  @State() bookingNumber = null;
  @State() page_mode: 'single' | 'multi' = 'multi';
  @State() currentPage: 'bookings' | 'booking-details' = 'bookings';
  @State() selectedBooking: Booking | null = null;

  private commonService = new CommonService();
  private propertyService = new PropertyService();

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
    } else {
      const token = await this.commonService.getBEToken();
      if (token) {
        app_store.app_data.token = token;
      }
    }
    this.initializeServices();
    this.initializeApp();
  }
  async initializeApp() {
    try {
      this.isLoading = true;
      let requests: any = [this.propertyService.getExposedGuest()];
      if (!this.be) {
        requests = [
          ...requests,
          this.commonService.getExposedLanguage(),
          this.propertyService.getExposedProperty({
            id: this.propertyid,
            language: app_store.userPreferences?.language_id || 'en',
            aname: this.aName,
            perma_link: this.perma_link,
          }),
        ];
      }
      await Promise.all(requests);
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }
  initializeServices() {
    this.propertyService.setToken(this.token);
    this.commonService.setToken(this.token);
  }
  @Listen('bl_routing')
  handleRouting(e: CustomEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const { params, route } = e.detail;
    this.currentPage = route;
    this.selectedBooking = params?.booking ?? null;
  }
  private renderPages() {
    if (this.currentPage === 'booking-details') {
      return <ir-booking-details-view booking={this.selectedBooking}></ir-booking-details-view>;
    }
    return (
      <ir-booking-overview
        token={this.token}
        propertyid={this.propertyid}
        language={this.language}
        maxPages={this.maxPages}
        showAllBookings={this.showAllBookings}
        be={this.be}
      ></ir-booking-overview>
    );
  }
  render() {
    if (!this.token) {
      return (
        <Host>
          <main class="flex h-screen flex-col  justify-center">
            <div class="mx-auto w-full max-w-md px-4">
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
    return (
      <Host>
        {this.headerShown && (
          <ir-nav
            isBookingListing
            showBookingCode={false}
            showCurrency={false}
            website={app_store.property?.space_theme.website}
            logo={app_store.property?.space_theme?.logo}
          ></ir-nav>
        )}
        {this.renderPages()}
        {this.footerShown && <ir-footer></ir-footer>}
      </Host>
    );
  }
}
