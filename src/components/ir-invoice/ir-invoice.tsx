import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { isBefore } from 'date-fns';
import { cn, formatAmount, getDateDifference, getUserPreference as getUserPreference, runScriptAndRemove } from '@/utils/utils';
import localizedWords from '@/stores/localization.store';
import app_store from '@/stores/app.store';
import { Booking, IVariations, Occupancy } from '@/models/booking.dto';
import { PropertyService } from '@/services/api/property.service';
import { CommonService } from '@/services/api/common.service';
import { AuthService } from '@/services/api/auth.service';
import { PaymentService, TBookingInfo } from '@/services/api/payment.service';
import { AllowedPaymentMethod } from '@/models/property';
import { BookingListingAppService } from '@/services/app/booking-listing.service';
import InvoiceSkeleton from './InvoiceSkeleton';
import Token from '@/models/Token';
import moment from 'moment/min/moment-with-locales';

@Component({
  tag: 'ir-invoice',
  styleUrl: 'ir-invoice.css',
  scoped: true,
})
export class IrInvoice {
  @Prop({ mutable: true }) email: string;
  @Prop() propertyId: number;
  @Prop() baseUrl: string = 'https://gateway.igloorooms.com/IRBE';
  @Prop() language: string;
  @Prop() bookingNbr: string;
  @Prop() isConfermation = true;
  @Prop() status: 0 | 1 = 1;
  @Prop() perma_link: string = null;
  @Prop() aName: string = null;
  @Prop() headerShown: boolean = true;
  @Prop() footerShown: boolean = true;
  @Prop() headerMessageShown: boolean = true;
  @Prop() locationShown: boolean = true;
  @Prop() be: boolean = false;
  @Prop() ticket: string;
  @Prop() version: string = '2.0';

  @State() booking: Booking;
  @State() isAuthenticated = false;
  @State() isLoading = false;
  @State() cancelation_message: string = null;
  @State() guarantee_message: string = null;
  @State() cancelationMessage: string;
  @State() amountToBePayed: number;
  @State() cancelation_policies: TBookingInfo[] = [];

  private token = new Token();
  private propertyService = new PropertyService();
  private commonService = new CommonService();
  private authService = new AuthService();
  private paymentService = new PaymentService();
  private bookingListingAppService = new BookingListingAppService();

  private payment_option: AllowedPaymentMethod = null;
  private amount: number = null;
  private bookingCancelation: HTMLIrBookingCancellationElement;
  private privacyPolicyRef: HTMLIrPrivacyPolicyElement;

  async componentWillLoad() {
    if (!this.baseUrl) {
      throw new Error('Missing base url');
    }
    this.isLoading = true;
    if (!this.be) {
      getUserPreference(this.language);
    }
    const isAuthenticated = this.commonService.checkUserAuthState();
    if (isAuthenticated) {
      this.token.setToken(isAuthenticated.token);
      this.isAuthenticated = true;
    } else {
      if (this.ticket) {
        this.token.setToken(this.ticket);
        this.isAuthenticated = true;
        return;
      }
      const token = await this.commonService.getBEToken();
      this.token.setToken(token);
    }

    this.fetchData();
  }

  @Watch('bookingNbr')
  async handleBookingNumberChange(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.booking = await this.propertyService.getExposedBooking(
        { booking_nbr: this.bookingNbr, language: this.language || app_store.userPreferences.language_id, currency: null },
        true,
      );
    }
  }
  @Watch('ticket')
  async handleTicketChange(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.token.setToken(this.ticket);
      this.isAuthenticated = true;
    }
  }

  async fetchData(language = this.language?.toLowerCase() || app_store.userPreferences.language_id, resetLanguage = false) {
    if (!this.isAuthenticated) {
      const token = await this.authService.login({ option: 'direct', params: { email: this.email, booking_nbr: this.bookingNbr } }, false);
      this.token.setToken(token);
    }
    const requests: any[] = [this.propertyService.getExposedBooking({ booking_nbr: this.bookingNbr, language, currency: null })];
    if (!this.be || resetLanguage) {
      requests.push(this.commonService.getExposedLanguage());
      requests.push(
        this.propertyService.getExposedProperty({
          id: this.propertyId,
          language,
          aname: this.aName,
          perma_link: this.perma_link,
        }),
      );
    }

    const results = await Promise.all(requests);
    this.booking = results[0];
    this.payment_option = this.bookingListingAppService.detectPaymentOrigin(this.booking);

    const book_date = new Date(this.booking.booked_on.date);
    book_date.setHours(this.booking.booked_on.hour + 1);
    book_date.setMinutes(this.booking.booked_on.minute);
    await this.setAmountAndCancelationPolicy();
    this.isLoading = false;
  }

  @Listen('openPrivacyPolicy')
  async openPrivacyPolicy(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (this.privacyPolicyRef) {
      this.privacyPolicyRef.openModal();
    }
  }
  @Listen('languageChanged', { target: 'body' })
  async handleLanguageChanged(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    console.warn('request fetchData');
    this.fetchData(e.detail, true);
  }
  async setAmountAndCancelationPolicy() {
    // if (this.amount || isBefore(new Date(this.booking.to_date), new Date())) {
    //   return;
    // }
    // const [bookings_by_amount] = await Promise.all([this.paymentService.getBookingPrepaymentAmount(this.booking)]);
    // const { amount, cancelation_message, guarantee_message, cancelation_policies } = bookings_by_amount;
    // this.cancelation_policies = cancelation_policies;
    // this.cancelation_message = cancelation_message;
    // this.guarantee_message = guarantee_message;
    // this.amount = amount;
  }

  renderBookingDetailHeader() {
    const total_nights = getDateDifference(moment(this.booking.from_date, 'YYYY-MM-DD'), moment(this.booking.to_date, 'YYYY-MM-DD'));
    // const nbr_of_persons = this.booking.occupancy.adult_nbr + this.booking.occupancy.children_nbr;
    const nbr_of_persons = this.booking.rooms.reduce(
      (prev, room) => prev + Number(room.rateplan.selected_variation.adult_nbr) + Number(room.rateplan.selected_variation.child_nbr),
      0,
    );
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
    if (this.booking?.extras?.find(e => e.key === 'agent_payment_mode')?.value === '001') {
      return <p class="total-payment text-sm">{localizedWords.entries.Lcz_OnCredit}</p>;
    }

    if (!paymentOption) {
      return null;
    }

    if (paymentOption.is_payment_gateway) {
      const amount = this.booking.financial.payments?.reduce((prev, cur) => cur.amount + prev, 0) ?? 0;
      return (
        <p class="total-payment text-sm">
          {localizedWords.entries.Lcz_YouHavePaid} <span>{formatAmount(amount, this.booking.currency.code)}</span>
        </p>
      );
    }
    if (paymentOption.code === '005') {
      return (
        <div>
          <p class="total-payment text-sm">
            {localizedWords.entries.Lcz_DueAmountNow} <span>{formatAmount(this.booking.financial.due_amount, this.booking.currency.code)}</span>
          </p>
          {/* <p>{paymentOption.description}</p> */}
          <p
            class="mt-1.5 text-xs text-gray-700"
            innerHTML={
              paymentOption.localizables?.find(d => d.language.code.toLowerCase() === app_store.userPreferences.language_id.toLowerCase())?.description ||
              paymentOption.localizables?.find(d => d.language.code.toLowerCase() === 'en')?.description
            }
          ></p>
        </div>
      );
    }
    if (paymentOption.code === '000') {
      return <p class="total-payment text-sm">{localizedWords.entries.Lcz_NoDepositRequired}</p>;
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
        <div class="flex  flex-col gap-4 ">
          <InvoiceSkeleton />
        </div>
      );
    }
    const google_maps_url = `http://maps.google.com/maps?q=${app_store.property.location.latitude},${app_store.property.location.longitude}`;

    const { cancel, payment } = this.bookingListingAppService.getBookingActions(this.booking);
    console.log(app_store.userPreferences.language_id);
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
              <div class={'invoice-container'}>
                <p class={`flex items-center gap-4 text-xl font-medium ${this.status === 1 ? 'text-green-600' : 'text-red-500'} ${this.be ? '' : ''}`}>
                  <ir-icons name={this.status === 1 ? 'check' : 'xmark'} />
                  <span> {this.status === 1 ? localizedWords.entries.Lcz_YourBookingIsConfirmed : localizedWords.entries.Lcz_YourPaymentIsUnsuccesful}</span>
                </p>
                {this.status === 1 && <p>{localizedWords.entries.Lcz_AnEmailHasBeenSent.replace('%1', this.booking.guest.email)}</p>}
              </div>
            ) : (
              <div class={'invoice-container'}>
                <p class={'text-xl font-medium '}>{localizedWords.entries.Lcz_ThisBookingIs.replace('%1', this.booking.status.description)}</p>
              </div>
            )}
            <div class={`flex  ${this.locationShown ? 'w-full' : 'w-full'} gap-16 `}>
              <div class={`invoice-container ${this.locationShown ? 'w-full' : 'w-full'}`}>
                <section class="flex flex-col gap-4 md:flex-row md:items-center">
                  {payment.show && this.status === 1 && (
                    <ir-button label={payment.label} class={'w-full text-center md:w-fit'} onButtonClick={() => this.processPayment()}></ir-button>
                  )}
                  {this.status === 1 ? (
                    <a href={google_maps_url} target="_blank" class={cn(`button-outline`, 'flex items-center justify-center')} data-size="sm">
                      {localizedWords.entries.Lcz_GetDirections}
                    </a>
                  ) : (
                    this.payment_option.is_payment_gateway && (
                      <ir-button
                        class={'w-full text-center md:w-fit'}
                        label={localizedWords.entries.Lcz_RetryPayment + ' ' + payment.formattedAmount}
                        onButtonClick={() => this.processPayment()}
                      ></ir-button>
                    )
                  )}
                  <a href={this.getPropertyEmail()} target="_blank" class={cn(`button-outline`, 'flex items-center justify-center')} data-size="sm">
                    {localizedWords.entries.Lcz_MessageProperty}
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
                    {localizedWords.entries.Lcz_BookingReference} <span>{this.booking.booking_nbr}</span>
                  </p>
                  <p class="booking-info-text">
                    {localizedWords.entries.Lcz_BookedBy}{' '}
                    <span>
                      {this.booking.guest.first_name} {this.booking.guest.last_name}
                    </span>
                  </p>
                  <p class="booking-info-text">
                    {localizedWords.entries.Lcz_CheckIn}: <span>{moment(this.booking.from_date, 'YYYY-MM-DD').format('ddd, DD MMM YYYY')} </span>
                    <span>
                      {localizedWords.entries.Lcz_From} {app_store.property?.time_constraints.check_in_from}
                    </span>
                  </p>
                  <p class="booking-info-text">
                    {localizedWords.entries.Lcz_CheckOut}: <span>{moment(this.booking.to_date).format('ddd, DD MMM YYYY')} </span>
                    <span>
                      {localizedWords.entries.Lcz_Before} {app_store.property?.time_constraints.check_out_till}
                    </span>
                  </p>
                  <p class="booking-info-text">
                    {localizedWords.entries.Lcz_ArrivalTime} <span>{this.booking.arrival.description}</span>
                  </p>
                  {this.booking.remark && (
                    <p class="booking-info-text">
                      {localizedWords.entries.Lcz_SpecialRequest}: <span>{this.booking.remark}</span>
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
                            {room.guest.first_name} {room.guest.last_name} (<span innerHTML={this.formatOccupancy(room.rateplan.selected_variation, room.occupancy)}></span>)
                          </span>
                        </p>
                        <p class="room-info-text">
                          {localizedWords.entries.Lcz_MealPlan}{' '}
                          <span>
                            {room.rateplan.name}
                            {/* <span>{"- Non-smoking"}</span> */}
                          </span>
                        </p>
                        {this.cancelation_message && <p class="room-info-text" innerHTML={`${localizedWords.entries.Lcz_Cancelation}: ${this.cancelation_message}`}></p>}
                        {this.guarantee_message && <p class="room-info-text" innerHTML={`${localizedWords.entries.Lcz_Guarantee}: ${this.guarantee_message}`}></p>}
                      </div>
                    ))}
                  </div>
                </section>
                {this.booking.pickup_info && (
                  <section class="space-y-2">
                    <div class={'flex items-center gap-4'}>
                      <ir-icons name="taxi"></ir-icons>
                      <h3 class={'booking-details-header'}>{localizedWords.entries.Lcz_Pickup}</h3>
                    </div>
                    <div class="room-info">
                      <div class="flex w-full items-center justify-between">
                        <p class="flex items-center gap-4">
                          <p class="room-info-text">
                            {`${localizedWords.entries.Lcz_Date}:`} <span>{moment(this.booking.pickup_info.date, 'YYYY-MM-DD').format('ddd, DD MMM YYYY')}</span>
                          </p>
                          <p class="room-info-text">
                            {`${localizedWords.entries.Lcz_Time}:`}{' '}
                            <span>
                              {this.booking.pickup_info.hour}:{this.booking.pickup_info.minute}
                            </span>
                          </p>
                        </p>
                        <p class="text-lg font-medium text-green-600">{formatAmount(this.booking.pickup_info.total, this.booking.pickup_info.currency.code)}</p>
                      </div>
                      <p class="room-info-text">
                        {`${localizedWords.entries.Lcz_FlightDetails}:`} <span>{this.booking.pickup_info.details}</span>
                      </p>
                      <p class="room-info-text">
                        {`${localizedWords.entries.Lcz_NoOfVehicles}:`} <span>{this.booking.pickup_info.nbr_of_units}</span>
                      </p>
                      <p class={'room-info-text text-xs'}>
                        {app_store.property.pickup_service.pickup_instruction.description}
                        {app_store.property.pickup_service.pickup_cancelation_prepayment.description}
                      </p>
                    </div>
                  </section>
                )}
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

                <section class="space-y-2">
                  <div class="flex items-center gap-4">
                    <ir-icons name="danger"></ir-icons>
                    <h3 class={'booking-details-header'}>{localizedWords.entries.Lcz_ImportantInformation}</h3>
                  </div>
                  <p innerHTML={app_store.property.description.important_info}></p>
                </section>
                <section class={'space-y-2'}>
                  <div class="flex items-center gap-4">
                    <ir-icons name="car"></ir-icons>
                    <p>
                      {app_store.property?.parking_offering.title} {localizedWords.entries.Lcz_At}{' '}
                      {app_store.property?.parking_offering.pricing > 0 && (
                        <span>
                          {formatAmount(app_store.property?.parking_offering.pricing, app_store.userPreferences.currency_id)}/{app_store.property?.parking_offering.schedule}
                        </span>
                      )}
                    </p>
                  </div>
                  <div class="flex items-center gap-4">
                    <ir-icons name="pets"></ir-icons>
                    <p>{app_store.property?.pets_acceptance.title}</p>
                  </div>
                  <div class="flex items-center gap-4 ">
                    <ir-icons name="baby"></ir-icons>
                    <p>{app_store.property?.baby_cot_offering.title}</p>
                  </div>
                </section>
              </div>
              {this.locationShown && (
                <div class="property_info sticky top-[20%]">
                  {app_store.property?.space_theme.background_image && (
                    <div class="lg:aspect9-[16/9] aspect-[1/1] max-h-32 w-full">
                      <img
                        loading="lazy"
                        class="property_img h-full w-full object-cover"
                        src={app_store.property?.images.length === 0 ? app_store.property.space_theme.background_image : app_store.property?.images[0].url}
                        alt={app_store.property?.images.length === 0 ? app_store.property.name : app_store.property.images[0].tooltip}
                      />
                    </div>
                  )}
                  <a class="mapLink" target="_blank" href={google_maps_url}>
                    <img
                      alt="property_location"
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
          {this.footerShown && <ir-privacy-policy hideTrigger ref={el => (this.privacyPolicyRef = el)}></ir-privacy-policy>}
          <ir-booking-cancellation booking={this.booking} ref={el => (this.bookingCancelation = el)}></ir-booking-cancellation>
        </main>
      </Host>
    );
  }
  private formatOccupancy({ adult_nbr, child_nbr }: IVariations, { infant_nbr }: Occupancy) {
    const adultCount = adult_nbr > 0 ? adult_nbr : 0;
    const childCount = child_nbr > 0 ? child_nbr : 0;
    const infantCount = infant_nbr > 0 ? infant_nbr : 0;

    const adultLabel = adultCount > 1 ? localizedWords.entries.Lcz_Adults.toLowerCase() : localizedWords.entries.Lcz_Adult.toLowerCase();
    const childLabel = childCount > 1 ? localizedWords.entries.Lcz_Children.toLowerCase() : localizedWords.entries.Lcz_Child.toLowerCase();
    const infantLabel = infantCount > 1 ? (localizedWords.entries.Lcz_Infants || 'Infants').toLowerCase() : (localizedWords.entries.Lcz_infant || 'Infant').toLowerCase();

    const parts = [];
    if (adultCount > 0) {
      parts.push(`${adultCount} ${adultLabel}`);
    }
    if (childCount > 0) {
      parts.push(`${childCount} ${childLabel}`);
    }
    if (infantCount > 0) {
      parts.push(`${infantCount} ${infantLabel}`);
    }

    return parts.join('&nbsp&nbsp&nbsp&nbsp');
  }
}
