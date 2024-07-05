import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { format } from 'date-fns';
import { cn, formatAmount, getDateDifference, runScriptAndRemove } from '@/utils/utils';
import localizedWords from '@/stores/localization.store';
import app_store from '@/stores/app.store';
import { Booking } from '@/models/booking.dto';
import { PropertyService } from '@/services/api/property.service';
import { CommonService } from '@/services/api/common.service';
import axios from 'axios';
import { AuthService } from '@/services/api/auth.service';
import { PaymentService } from '@/services/api/payment.service';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { AllowedPaymentMethod } from '@/models/property';
import { BookingListingAppService } from '@/services/app/booking-listing.service';

@Component({
  tag: 'ir-invoice',
  styleUrl: 'ir-invoice.css',
  scoped: true,
})
export class IrInvoice {
  @Prop({ mutable: true }) email: string;
  @Prop() propertyId: number;
  @Prop() baseUrl: string;
  @Prop() language: string = 'en';
  @Prop() bookingNbr: string;
  @Prop() status: 0 | 1 = 1;
  @Prop() perma_link: string = null;
  @Prop() aName: string = null;
  @Prop() headerShown: boolean = true;
  @Prop() footerShown: boolean = true;
  @Prop() locationShown: boolean = true;
  @Prop() be: boolean = false;

  @State() booking: Booking;
  @State() token: string;
  @State() isAuthenticated = false;
  @State() isLoading = false;

  private propertyService = new PropertyService();
  private commonService = new CommonService();
  private authService = new AuthService();
  private paymentService = new PaymentService();
  private bookingListingAppService = new BookingListingAppService();

  private alertDialog: HTMLIrAlertDialogElement;

  async componentWillLoad() {
    if (!this.baseUrl) {
      throw new Error('Missing base url');
    }
    axios.defaults.baseURL = this.baseUrl;
    axios.defaults.withCredentials = true;
    this.isLoading = true;
    const isAuthenticated = this.commonService.checkUserAuthState();
    console.log(isAuthenticated);
    if (isAuthenticated) {
      this.token = isAuthenticated.token;
      this.isAuthenticated = true;
    } else {
      this.token = await this.commonService.getBEToken();
    }

    this.init();
    this.fetchData();
  }
  private detectPaymentOrigin() {
    if (!this.booking.extras) {
      return null;
    }
    const code = this.booking.extras.find(e => e.key === 'payment_code').value;
    if (!code) {
      return null;
    }
    return app_store.property.allowed_payment_methods.find(apm => apm.code === code) ?? null;
  }
  // @Watch('token')
  // handleTokenChange() {
  //   this.init();
  // }
  @Watch('bookingNbr')
  async handleBookingNumberChange(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.booking = await this.propertyService.getExposedBooking({ booking_nbr: this.bookingNbr, language: this.language }, true);
    }
  }
  async init() {
    this.propertyService.setToken(this.token);
    this.commonService.setToken(this.token);
    this.authService.setToken(this.token);
    this.paymentService.setToken(this.token);
  }
  async fetchData() {
    if (!this.isAuthenticated) {
      this.token = await this.authService.login({ option: 'direct', params: { email: this.email, booking_nbr: this.bookingNbr } }, true);
      this.init();
    }
    const requests: any[] = [this.propertyService.getExposedBooking({ booking_nbr: this.bookingNbr, language: this.language })];

    if (!this.be) {
      requests.push(this.commonService.getExposedLanguage());
      requests.push(
        this.propertyService.getExposedProperty({
          id: this.propertyId,
          language: this.language,
          aname: this.aName,
          perma_link: this.perma_link,
        }),
      );
    }

    const results = await Promise.all(requests);
    this.isLoading = false;
    this.booking = results[0];
  }

  renderBookingDetailHeader() {
    const total_nights = getDateDifference(new Date(this.booking.from_date), new Date(this.booking.to_date));
    const nbr_of_persons = this.booking.occupancy.adult_nbr + this.booking.occupancy.children_nbr;
    const total_rooms = this.booking.rooms.length;
    return `${total_nights} ${total_nights > 1 ? localizedWords.entries.Lcz_Nights : localizedWords.entries.Lcz_night} - ${nbr_of_persons}
    ${nbr_of_persons > 1 ? localizedWords.entries.Lcz_Persons : localizedWords.entries.Lcz_Person} - ${total_rooms}
    ${total_rooms > 1 ? localizedWords.entries.Lcz_Rooms : localizedWords.entries.Lcz_Room}`;
  }
  getPropertyEmail() {
    const { email } = app_store.property?.contacts?.find(c => c.type === 'booking');
    if (!email) {
      return null;
    }
    const subject = `Ref Booking#${this.bookingNbr}`;
    const encodedSubject = encodeURIComponent(subject);
    return `mailto:${email}?subject=${encodedSubject}`;
  }
  renderPaymentText(paymentOption: AllowedPaymentMethod) {
    if (paymentOption.is_payment_gateway) {
      return (
        <p class="total-payment text-sm">
          {localizedWords.entries.Lcz_YouHavePaid} <span>{formatAmount(this.booking.financial.total_amount, this.booking.currency.code)}</span>
        </p>
      );
    }
    if (paymentOption.code === '005') {
      return (
        <div>
          <p class="total-payment text-sm">
            {localizedWords.entries.Lcz_DueAmountNow} <span>{formatAmount(this.booking.financial.due_amount, this.booking.currency.code)}</span>
          </p>
          <p>{paymentOption.description}</p>
        </div>
      );
    }
    return (
      <p class="total-payment text-sm">
        {localizedWords.entries.Lcz_YourCardWillBeCharged} <span>{formatAmount(this.booking.financial.gross_total, this.booking.currency.code)}</span>
      </p>
    );
  }
  private async processPayment() {
    const paymentCode = this.booking.extras.find(e => e.key === 'payment_code');
    if (!paymentCode) {
      console.error('missing paymentcode');
      return;
    }
    const prePaymentAmount = this.booking.extras.find(e => e.key === 'prepayment_amount');
    if (!prePaymentAmount) {
      console.error('missing prepayment amount');
      return;
    }
    const paymentMethod = app_store.property.allowed_payment_methods.find(apm => apm.code === paymentCode.value);
    if (!paymentMethod) {
      console.error('Invalid payment method');
      return;
    }
    if (Number(prePaymentAmount.value) > 0) {
      await this.paymentService.GeneratePaymentCaller({
        token: app_store.app_data.token,
        params: {
          booking_nbr: this.booking.booking_nbr,
          amount: Number(prePaymentAmount.value) ?? 0,
          currency_id: this.booking.currency.id,
          email: this.booking.guest.email,
          pgw_id: paymentMethod.id.toString(),
        },
        onRedirect: url => (window.location.href = url),
        onScriptRun: script => runScriptAndRemove(script),
      });
    }
  }
  render() {
    if (!this.booking) {
      return null;
    }
    if (this.isLoading) {
      return (
        <div class="flex h-[80vh] flex-col gap-4 ">
          {[...Array(10)].map((_, i) => (
            <div key={i} class="max-h-52 w-full animate-pulse bg-gray-200"></div>
          ))}
        </div>
      );
    }
    const google_maps_url = `http://maps.google.com/maps?q=${app_store.property.location.latitude},${app_store.property.location.longitude}`;
    const payment_option = this.detectPaymentOrigin();
    const { cancel } = this.bookingListingAppService.getBookingActions(this.booking);
    return (
      <Host>
        <ir-interceptor></ir-interceptor>
        <main class="relative flex w-full flex-col space-y-5">
          {this.headerShown && (
            <section class="sticky top-0 z-50 m-0  w-full  p-0">
              <ir-nav
                class={'m-0 p-0'}
                showBookingCode={false}
                website={app_store.property?.space_theme.website}
                logo={app_store.property?.space_theme?.logo}
                menuShown={this.be}
              ></ir-nav>
            </section>
          )}
          <section class={`flex-1 ${this.be ? '' : 'mx-auto px-4 lg:px-6'}`}>
            <div class={`flex  ${this.locationShown ? 'max-w-6xl' : 'w-full'} gap-16`}>
              <div class={`invoice-container ${this.locationShown ? '' : 'w-full'}`}>
                <section class="flex flex-col gap-4 md:flex-row md:items-center">
                  {this.status === 1 ? (
                    <a href={google_maps_url} target="_blank" class={cn(`button-outline`, 'flex items-center justify-center')} data-size="sm">
                      {localizedWords.entries.Lcz_GetDirections}
                    </a>
                  ) : (
                    payment_option.is_payment_gateway && <ir-button variants="outline" label="Retry Payment" onButtonClick={() => this.processPayment()}></ir-button>
                  )}
                  <a href={this.getPropertyEmail()} target="_blank" class={cn(`button-outline`, 'flex items-center justify-center')} data-size="sm">
                    Message property
                  </a>
                  {cancel && (
                    <ir-button
                      class={'w-full md:w-fit'}
                      variants="outline"
                      label={localizedWords.entries.Lcz_CancelBooking}
                      onButtonClick={() => {
                        this.alertDialog.openModal();
                      }}
                    ></ir-button>
                  )}
                </section>
                <section class="booking-info">
                  <p class="booking-info-text">
                    {localizedWords.entries.Lcz_BookingPreference} <span>{this.booking.booking_nbr}</span>
                  </p>
                  <p class="booking-info-text">
                    {localizedWords.entries.Lcz_BookedBy}{' '}
                    <span>
                      {this.booking.guest.first_name} {this.booking.guest.last_name}
                    </span>
                  </p>
                  <p class="booking-info-text">
                    {localizedWords.entries.Lcz_CheckIn}: <span>{format(this.booking.from_date, 'eee, dd MMM yyyy')} </span>
                    <span>
                      {localizedWords.entries.Lcz_From} {app_store.property?.time_constraints.check_in_from}
                    </span>
                  </p>
                  <p class="booking-info-text">
                    {localizedWords.entries.Lcz_CheckOut}: <span>{format(this.booking.to_date, 'eee, dd MMM yyyy')} </span>
                    <span>
                      {localizedWords.entries.Lcz_Before} {app_store.property?.time_constraints.check_out_till}
                    </span>
                  </p>
                  <p class="booking-info-text">
                    {localizedWords.entries.Lcz_ArrivalTime} <span>{this.booking.arrival.description}</span>
                  </p>
                  {this.booking.remark && (
                    <p class="booking-info-text">
                      Special request: <span>{this.booking.remark}</span>
                    </p>
                  )}
                </section>
                <section class="booking-details space-y-2">
                  <div class="flex flex-wrap items-center justify-between gap-1 text-center md:text-right">
                    <div class="flex items-center gap-4">
                      <ir-icons name="bed"></ir-icons>
                      <h3 class="booking-details-header">{this.renderBookingDetailHeader()}</h3>
                    </div>
                    <p class="text-xs">{app_store.property?.tax_statement}</p>
                  </div>
                  <div>
                    {this.booking.rooms?.map(room => (
                      <div class="room-info" key={room.identifier}>
                        <div class="flex w-full items-center justify-between">
                          <h4 class="room-type">{room.roomtype.name}</h4>
                          <p class="text-lg font-medium text-green-500"> {formatAmount(room.gross_total, this.booking.currency.code)}</p>
                        </div>
                        <p class="room-info-text">
                          {localizedWords.entries.Lcz_GuestName}{' '}
                          <span>
                            {room.guest.first_name} {room.guest.last_name} ({room.rateplan.selected_variation.adult_child_offering})
                          </span>
                        </p>
                        <p class="room-info-text">
                          {localizedWords.entries.Lcz_MealPlan}{' '}
                          <span>
                            {room.rateplan.name}
                            {/* <span>{"- Non-smoking"}</span> */}
                          </span>
                        </p>
                        <p class="room-info-text" innerHTML={room.rateplan.cancelation}></p>
                        <p class="room-info-text" innerHTML={room.rateplan.guarantee}></p>
                      </div>
                    ))}
                  </div>
                </section>

                {payment_option && (
                  <section class="space-y-2">
                    <div class={'flex items-center gap-4'}>
                      <ir-icons name="credit_card"></ir-icons>
                      <h3>{localizedWords.entries.Lcz_PaymentDetails}</h3>
                    </div>
                    <p class="total-payment">
                      {localizedWords.entries.Lcz_Total} <span class="text-green-500">{formatAmount(this.booking.financial.gross_total, this.booking.currency.code)}</span>
                    </p>
                    {this.renderPaymentText(payment_option)}
                  </section>
                )}

                <section class="space-y-2">
                  <div class="flex items-center gap-4">
                    <ir-icons name="danger"></ir-icons>
                    <h3>{localizedWords.entries.Lcz_ImportantInformation}</h3>
                  </div>
                  <p>{app_store.property.description.important_info}</p>
                </section>
                <section class={'space-y-2'}>
                  <div class="flex items-center gap-4">
                    <ir-icons name="car"></ir-icons>
                    <p>
                      {app_store.property?.parking_offering.title} {localizedWords.entries.Lcz_At}{' '}
                      {formatAmount(app_store.property?.parking_offering.pricing, app_store.userPreferences.currency_id)}
                    </p>
                  </div>
                  <div class="flex items-center gap-4">
                    <ir-icons name="pets"></ir-icons>
                    <p>{app_store.property?.pets_acceptance.title}</p>
                  </div>
                  <div class="flex items-center gap-4 ">
                    <ir-icons name="bed"></ir-icons>
                    <p>{app_store.property?.baby_cot_offering.title}</p>
                  </div>
                </section>
              </div>
              {this.locationShown && (
                <div class="property_info sticky top-[20%]">
                  {app_store.property?.space_theme.background_image && (
                    <div class="lg:aspect9-[16/9] aspect-[1/1] max-h-32 w-full">
                      <img class="property_img h-full w-full object-cover" src={app_store.property?.space_theme.background_image} alt="" />
                    </div>
                  )}
                  <a class="mapLink" target="_blank" href={google_maps_url}>
                    <img
                      src={`https://maps.googleapis.com/maps/api/staticmap?center=${app_store.property?.location.latitude || 34.022},${app_store.property?.location.longitude || 35.628}&zoom=15&size=1024x768&maptype=roadmap&markers=color:red%7Clabel:${app_store.property.name}%7C34.022,35.628&key=AIzaSyCJ5P4SraJdZzcBi9Ue16hyg_iWJv-aHpk`}
                      loading="lazy"
                    ></img>
                  </a>
                  <div class="contact-info">
                    <span>
                      <label class="m-0 p-0" htmlFor="phone">
                        {localizedWords.entries.Lcz_Phone}
                      </label>
                    </span>
                    <a id="phone" class="contact-link p-0" href={`tel:${app_store.property?.phone}`}>
                      {app_store.property?.country?.phone_prefix || ''} {app_store.property?.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
          {this.footerShown && <ir-footer></ir-footer>}
          <ir-alert-dialog ref={el => (this.alertDialog = el)}>
            <h2 slot="modal-title">Booking Cancellation</h2>
            <p slot="modal-body" class="pt-2" innerHTML={this.booking.rooms[0].rateplan.cancelation}></p>
            <div slot="modal-footer">
              <ir-button
                label="Cancel"
                variants="outline"
                onButtonClick={() => {
                  this.alertDialog.closeModal();
                }}
              ></ir-button>
              <ir-button
                label="Accept & Confirm"
                isLoading={isRequestPending('/Request_Booking_Cancelation')}
                onButtonClick={async () => {
                  await this.paymentService.RequestBookingCancelation(this.bookingNbr);
                  this.alertDialog.closeModal();
                }}
              ></ir-button>
            </div>
          </ir-alert-dialog>
        </main>
      </Host>
    );
  }
}
