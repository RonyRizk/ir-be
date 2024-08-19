import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { format, isBefore } from 'date-fns';
import { cn, formatAmount, getDateDifference, runScriptAndRemove } from '@/utils/utils';
import localizedWords from '@/stores/localization.store';
import app_store from '@/stores/app.store';
import { Booking } from '@/models/booking.dto';
import { PropertyService } from '@/services/api/property.service';
import { CommonService } from '@/services/api/common.service';
import axios from 'axios';
import { AuthService } from '@/services/api/auth.service';
import { PaymentService, TBookingInfo } from '@/services/api/payment.service';
import { AllowedPaymentMethod } from '@/models/property';
import { BookingListingAppService } from '@/services/app/booking-listing.service';
import InvoiceSkeleton from './InvoiceSkeleton';

@Component({
  tag: 'ir-invoice',
  styleUrl: 'ir-invoice.css',
  scoped: true,
})
export class IrInvoice {
  @Prop({ mutable: true }) email: string;
  @Prop() propertyId: number;
  @Prop() baseUrl: string = 'https://gateway.igloorooms.com/IRBE';
  @Prop() language: string = 'en';
  @Prop() bookingNbr: string;
  @Prop() status: 0 | 1 = 1;
  @Prop() perma_link: string = null;
  @Prop() aName: string = null;
  @Prop() headerShown: boolean = true;
  @Prop() footerShown: boolean = true;
  @Prop() headerMessageShown: boolean = true;
  @Prop() locationShown: boolean = true;
  @Prop() be: boolean = false;
  @Prop() version: string = '2.0';

  @State() booking: Booking;
  @State() token: string;
  @State() isAuthenticated = false;
  @State() isLoading = false;
  @State() cancelation_message: string = null;
  @State() guarantee_message: string = null;
  @State() cancelationMessage: string;
  @State() amountToBePayed: number;
  @State() cancelation_policies: TBookingInfo[] = [];

  private propertyService = new PropertyService();
  private commonService = new CommonService();
  private authService = new AuthService();
  private paymentService = new PaymentService();
  private bookingListingAppService = new BookingListingAppService();
  private payment_option: AllowedPaymentMethod = null;
  private amount: number = null;
  bookingCancelation: HTMLIrBookingCancelationElement;

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
    app_store.app_data.token = this.token;
  }
  async fetchData() {
    if (!this.isAuthenticated) {
      this.token = await this.authService.login({ option: 'direct', params: { email: this.email, booking_nbr: this.bookingNbr } }, false);
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
    this.booking = results[0];
    this.payment_option = this.detectPaymentOrigin();
    const book_date = new Date(this.booking.booked_on.date);
    book_date.setHours(this.booking.booked_on.hour + 1);
    book_date.setMinutes(this.booking.booked_on.minute);
    await this.setAmountAndCancelationPolicy();
    this.isLoading = false;
  }

  async setAmountAndCancelationPolicy() {
    if (this.amount || isBefore(new Date(this.booking.to_date), new Date())) {
      return;
    }
    const [bookings_by_amount, newPrepayment] = await Promise.all([
      this.paymentService.getBookingPrepaymentAmount(this.booking),
      await this.paymentService.GetExposedApplicablePolicies({
        book_date: new Date(this.booking.booked_on.date),
        token: this.token,
        params: {
          booking_nbr: this.bookingNbr,
          property_id: this.booking.property.id,
          room_type_id: 0,
          rate_plan_id: 0,
          currency_id: this.booking.currency.id,
          language: this.language,
        },
      }),
    ]);
    const { amount, cancelation_message, guarantee_message, cancelation_policies } = bookings_by_amount;
    this.cancelation_policies = cancelation_policies;
    this.cancelation_message = cancelation_message;
    this.guarantee_message = guarantee_message;
    this.amount = amount;
    let cancelation = null;
    let guarantee = null;
    const { message } = await this.paymentService.fetchCancelationMessage({ data: newPrepayment.data });
    this.cancelationMessage = message;
    const cancelationBrackets = newPrepayment.data.find(t => t.type === 'cancelation');
    if (cancelationBrackets?.brackets) {
      cancelation = this.paymentService.findClosestDate(cancelationBrackets?.brackets);
    }
    const guaranteeBrackets = newPrepayment.data.find(t => t.type === 'guarantee');
    if (guaranteeBrackets?.brackets) {
      guarantee = this.paymentService.findClosestDate(guaranteeBrackets?.brackets);
    }
    if (guarantee && cancelation) {
      console.log(guarantee, cancelation);
      if (isBefore(new Date(guarantee.due_on), new Date(cancelation.due_on))) {
        this.amountToBePayed = cancelation.gross_amount;
      }
    }
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
          {localizedWords.entries.Lcz_YouHavePaid} <span>{formatAmount(this.amount, this.booking.currency.code)}</span>
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
    if (this.amount || Number(prePaymentAmount.value) > 0) {
      await this.paymentService.GeneratePaymentCaller({
        token: app_store.app_data.token,
        params: {
          booking_nbr: this.booking.booking_nbr,
          amount: Number(this.amount || prePaymentAmount.value) ?? 0,
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
    if (!this.booking && !this.isLoading) {
      return null;
    }
    if (this.isLoading) {
      return (
        // <div >
        //   {[...new Array(10)].map((_, i) => (
        //     <div key={i} class="h-72 w-full animate-pulse rounded-md bg-gray-200"></div>
        //   ))}
        // </div>
        <div class="flex  flex-col gap-4 ">
          <InvoiceSkeleton />
        </div>
      );
    }
    const google_maps_url = `http://maps.google.com/maps?q=${app_store.property.location.latitude},${app_store.property.location.longitude}`;

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
          <section class={`flex-1 ${this.be ? '' : 'invoice-container mx-auto w-full max-w-6xl'}`}>
            {this.headerMessageShown && isBefore(new Date(), new Date(this.booking.to_date)) ? (
              <div class={this.be ? '' : 'invoice-container'}>
                <p class={`flex items-center gap-4 text-xl font-medium ${this.status === 1 ? 'text-green-600' : 'text-red-500'} ${this.be ? '' : ''}`}>
                  <ir-icons name={this.status === 1 ? 'check' : 'xmark'} />
                  <span> {this.status === 1 ? 'Your booking is now confirmed' : 'Payment unsuccessful'}</span>
                </p>
                {this.status === 1 && <p>An email has been sent to {this.booking.guest.email}</p>}
              </div>
            ) : (
              <div class={this.be ? '' : 'invoice-container'}>
                <p class={'text-xl font-medium '}>This booking is {this.booking.status.description}</p>
              </div>
            )}
            <div class={`flex  ${this.locationShown ? 'w-full' : 'w-full'} gap-16 `}>
              <div class={`invoice-container ${this.locationShown ? 'w-full' : 'w-full'}`}>
                <section class="flex flex-col gap-4 md:flex-row md:items-center">
                  {this.status === 1 ? (
                    <a href={google_maps_url} target="_blank" class={cn(`button-outline`, 'flex items-center justify-center')} data-size="sm">
                      {localizedWords.entries.Lcz_GetDirections}
                    </a>
                  ) : (
                    this.payment_option.is_payment_gateway && <ir-button variants="outline" label="Retry Payment" onButtonClick={() => this.processPayment()}></ir-button>
                  )}
                  <a href={this.getPropertyEmail()} target="_blank" class={cn(`button-outline`, 'flex items-center justify-center')} data-size="sm">
                    Message property
                  </a>
                  {cancel.show && (
                    <ir-button
                      class={'w-full md:w-fit'}
                      variants="outline"
                      label={localizedWords.entries.Lcz_CancelBooking}
                      onButtonClick={async () => {
                        this.bookingCancelation.openDialog();
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
                          <p class="text-lg font-medium text-green-600"> {formatAmount(room.gross_total, this.booking.currency.code)}</p>
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
                        {this.cancelation_message && <p class="room-info-text" innerHTML={`<b><u>Cancelation:</u></b>${this.cancelation_message}`}></p>}
                        {this.guarantee_message && <p class="room-info-text" innerHTML={`<b><u>Guarantee:</u></b>${this.guarantee_message}`}></p>}
                      </div>
                    ))}
                  </div>
                </section>
                {this.booking.pickup_info && (
                  <section class="space-y-2">
                    <div class={'flex items-center gap-4'}>
                      <ir-icons name="taxi"></ir-icons>
                      <h3 class={'booking-details-header'}>Pickup</h3>
                    </div>
                    <div class="room-info">
                      <div class="flex w-full items-center justify-between">
                        <p class="flex items-center gap-4">
                          <p class="room-info-text">
                            {'Date:'} <span>{format(new Date(this.booking.pickup_info.date), 'eee, dd MMM yyyy')}</span>
                          </p>
                          <p class="room-info-text">
                            {'Time:'}{' '}
                            <span>
                              {this.booking.pickup_info.hour}:{this.booking.pickup_info.minute}
                            </span>
                          </p>
                        </p>
                        <p class="text-lg font-medium text-green-600">{formatAmount(this.booking.pickup_info.total, this.booking.pickup_info.currency.code)}</p>
                      </div>
                      <p class="room-info-text">
                        {'Flight details:'} <span>{this.booking.pickup_info.details}</span>
                      </p>
                      <p class="room-info-text">
                        {'No. of vehicles:'} <span>{this.booking.pickup_info.nbr_of_units}</span>
                      </p>
                      <p class={'room-info-text text-xs'}>
                        {app_store.property.pickup_service.pickup_instruction.description}
                        {app_store.property.pickup_service.pickup_cancelation_prepayment.description}
                      </p>
                    </div>
                  </section>
                )}
                {this.payment_option && (
                  <section class="space-y-2">
                    <div class={'flex items-center gap-4'}>
                      <ir-icons name="credit_card"></ir-icons>
                      <h3 class={'booking-details-header'}>{localizedWords.entries.Lcz_PaymentDetails}</h3>
                    </div>
                    <p class="total-payment">
                      {localizedWords.entries.Lcz_Total}{' '}
                      <span class="payment_amount text-green-600">{formatAmount(this.booking.financial.gross_total, this.booking.currency.code)}</span>
                    </p>
                    {this.renderPaymentText(this.payment_option)}
                  </section>
                )}

                <section class="space-y-2">
                  <div class="flex items-center gap-4">
                    <ir-icons name="danger"></ir-icons>
                    <h3 class={'booking-details-header'}>{localizedWords.entries.Lcz_ImportantInformation}</h3>
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
          {this.footerShown && <ir-footer version={this.version}></ir-footer>}
          <ir-booking-cancelation
            cancelation_policies={this.cancelation_policies}
            ref={el => (this.bookingCancelation = el)}
            booking_nbr={this.booking?.booking_nbr}
            currency={{ code: this.booking.currency.code, id: this.booking.currency.id }}
            cancelation={this.cancelationMessage || this.booking?.rooms[0].rateplan.cancelation}
          ></ir-booking-cancelation>
        </main>
      </Host>
    );
  }
}
