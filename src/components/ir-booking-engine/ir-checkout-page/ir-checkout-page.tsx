import { Booking, Currency } from '@/models/booking.dto';
import { CheckoutErrors, pages } from '@/models/common';
import { PickupFormData } from '@/models/pickup';
import { AllowedPaymentMethod, RoomType } from '@/models/property';
import { IrUserFormData } from '@/models/user_form';
import { AuthService } from '@/services/api/auth.service';
import { PaymentService } from '@/services/api/payment.service';
import { PropertyService } from '@/services/api/property.service';
import VariationService from '@/services/app/variation.service';
import app_store from '@/stores/app.store';
import booking_store, { calculateTotalRooms, clearCheckoutRooms, IRoomTypeSelection, validateBooking } from '@/stores/booking';
import { checkout_store } from '@/stores/checkout.store';
import localizedWords from '@/stores/localization.store';
import { detectCardType, generateCheckoutUrl, getDateDifference, injectHTMLAndRunScript, passedBookingCutoff } from '@/utils/utils';
import { ZCreditCardSchemaWithCvc } from '@/validators/checkout.validator';
import { Component, Host, Listen, State, h, Event, EventEmitter } from '@stencil/core';
import moment from 'moment';
import { ZodError, ZodIssue } from 'zod';

@Component({
  tag: 'ir-checkout-page',
  styleUrl: 'ir-checkout-page.css',
  scoped: true,
})
export class IrCheckoutPage {
  @State() isLoading = false;
  @State() error: CheckoutErrors;
  @State() selectedPaymentMethod: AllowedPaymentMethod | null = null;
  @State() prepaymentAmount: number;
  @State() isBookingConfirmed = false;

  @Event() routing: EventEmitter<pages>;

  private propertyService = new PropertyService();
  private paymentService = new PaymentService();
  private authService = new AuthService();

  private userForm: HTMLIrUserFormElement;
  private bookingDetails: HTMLIrBookingDetailsElement;
  private pickupForm: HTMLIrPickupElement;
  private errorElement: HTMLElement;
  alertRef: HTMLIrAlertDialogElement;

  async componentWillLoad() {
    this.calculateTotalPrepaymentAmount();
    if (app_store?.property?.allowed_payment_methods?.find(e => e.id === 13 && e.is_active)) {
      checkout_store.agreed_to_services = false;
    }
  }
  private async calculateTotalPrepaymentAmount() {
    try {
      this.isLoading = true;
      checkout_store.prepaymentAmount = this.prepaymentAmount;
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  @Listen('prepaymentChange')
  handlePrepaymentAmountChange(e: CustomEvent<number>) {
    this.prepaymentAmount = e.detail;
    checkout_store.prepaymentAmount = this.prepaymentAmount;
  }
  @Listen('bookingClicked')
  async handleBooking(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.resetErrorState();
    if (passedBookingCutoff()) {
      this.alertRef.openModal();
      return;
    }
    if (!this.validateUserForm() || !this.validateBookingDetails() || !this.validatePickupForm() || !this.validatePayment() || this.validatePolicyAcceptance()) {
      return;
    }
    // alert('do booking');
    await this.processBooking();
  }
  private validatePolicyAcceptance(): boolean {
    if (checkout_store.agreed_to_services) {
      return false;
    }
    this.error = { cause: 'booking-summary', issues: 'unchecked agreement' };
    return true;
  }
  private validatePayment(): boolean {
    if (booking_store.bookingAvailabilityParams.agent && booking_store.bookingAvailabilityParams?.agent?.payment_mode.code === '001') {
      return true;
    }
    if (!app_store.property.allowed_payment_methods.some(p => p.is_active)) {
      return true;
    }
    const currentPayment = app_store.property.allowed_payment_methods.find(p => p.code === checkout_store.payment?.code);
    this.selectedPaymentMethod = currentPayment;

    if (!currentPayment && this.prepaymentAmount > 0) {
      return false;
    }
    if (!currentPayment && this.prepaymentAmount === 0) {
      return true;
    }
    if (currentPayment?.is_payment_gateway || currentPayment?.code === '000' || currentPayment?.code === '005') {
      return true;
    }
    try {
      ZCreditCardSchemaWithCvc.parse({
        cardNumber: (checkout_store.payment as any)?.cardNumber?.replace(/ /g, ''),
        cardHolderName: (checkout_store.payment as any).cardHolderName,
        expiryDate: (checkout_store.payment as any)?.expiry_month,
        // cvc: (checkout_store.payment as any)?.cvc,
      });
      const cardType = detectCardType((checkout_store.payment as any)?.cardNumber?.replace(/ /g, ''));
      if (cardType !== 'AMEX') {
        return true;
      }
      if (!app_store.property.allowed_cards.find(c => c.name.toLowerCase().includes((cardType === 'AMEX' ? 'American Express' : cardType)?.toLowerCase()))) {
        return false;
      }
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        // console.log(error.issues);
        // if (error.issues.length === 4 && this.prepaymentAmount === 0) {
        //   return true;
        // }
        this.handleError('payment', error);
      }
      return false;
    }
  }

  private resetErrorState() {
    this.error = undefined;
  }

  private validateUserForm(): boolean {
    try {
      IrUserFormData.parse(checkout_store.userFormData);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(error.errors);
        this.handleError('user', error);
      }
      return false;
    }
  }

  private validateBookingDetails(): boolean {
    const isValid = validateBooking();
    if (!isValid) {
      this.error = {
        cause: 'booking-details',
        issues: 'missing guestname',
      };
      this.errorElement = this.bookingDetails;
      this.scrollToError();
      return false;
    }
    return true;
  }

  private validatePickupForm(): boolean {
    if (checkout_store.pickup.location) {
      try {
        PickupFormData.parse(checkout_store.pickup);
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          this.handleError('pickup', error);
        }
        return false;
      }
    }
    return true;
  }

  handleError(cause: 'pickup' | 'user' | 'payment', error: ZodError<any>) {
    let issues: Record<string, ZodIssue> = {};
    error.issues.map(issue => (issues[issue.path[0]] = issue));
    this.error = {
      cause,
      issues,
    };
    this.errorElement = cause === 'pickup' ? this.pickupForm : cause === 'user' ? this.userForm : null;
    if (cause !== 'payment') {
      this.scrollToError();
    }
  }

  private async processBooking() {
    try {
      const result = await this.propertyService.bookUser();
      this.isBookingConfirmed = true;
      booking_store.booking = result;
      // if (app_store.app_data.isFromGhs) {
      //   destroyBookingCookie();
      // }
      const conversionTag = app_store.property?.tags.find(t => t.key === 'conversion');
      if (conversionTag && conversionTag.value) {
        this.modifyConversionTag(conversionTag.value);
      }

      if (!this.selectedPaymentMethod || !this.selectedPaymentMethod?.is_payment_gateway || this.prepaymentAmount === 0) {
        app_store.invoice = {
          email: booking_store.booking.guest.email,
          booking_number: booking_store.booking.booking_nbr,
        };
        return (window.location.href = generateCheckoutUrl(app_store.property.perma_link, {
          e: result.guest.email,
          b: result.booking_nbr,
          lang: app_store.userPreferences.language_id,
          s: '1',
        }));
      } else {
        let token = app_store.app_data.token;
        if (!app_store.is_signed_in) {
          token = await this.authService.login(
            {
              option: 'direct',
              params: {
                email: result.guest.email,
                booking_nbr: result.booking_nbr,
              },
            },
            false,
          );
        }
        let paymentAmount = this.prepaymentAmount;
        const normalize = (s?: string) => (s || '').trim().toLowerCase();
        const getCurrencyByCode = (code: string) => app_store.currencies.find(c => normalize(c.code) === normalize(code)) || null;

        // Returns a Currency object from app_store.currencies or null if no change is needed.
        // Priority: user's currency (if allowed) → hotel's currency (if allowed) → first allowed currency.
        // If the chosen currency equals the user's currency, returns null to indicate no switch is needed.
        const getMostEffectiveCurrency = (): (typeof app_store.currencies)[number] | null => {
          const allowed = normalize(this.selectedPaymentMethod?.allowed_currencies || '');
          if (!allowed) return null;

          const allowedList = allowed
            .split(',')
            .map(c => normalize(c))
            .filter(Boolean);

          if (allowedList.length === 0) return null;

          // Resolve user + hotel currency objects (fall back to 'usd' only if needed)
          const userCode = normalize(app_store.userPreferences?.currency_id) || 'usd';
          const hotelCode = normalize(app_store.property?.currency?.code);
          const hotelCurrency = hotelCode ? getCurrencyByCode(hotelCode) : null;

          // 1) If the user's currency is allowed → no change.
          if (allowedList.includes(userCode)) return null;

          // 2) If the hotel's currency is allowed → switch to hotel currency.
          if (hotelCode && allowedList.includes(hotelCode) && hotelCurrency) return hotelCurrency;

          // 3) Otherwise, pick the first allowed currency we can resolve from the store.
          for (const code of allowedList) {
            const cur = getCurrencyByCode(code);
            if (cur) {
              // If this equals user currency (rare: user not in allowedList but store normalization mismatch), treat as no change.
              if (normalize(cur.code) === userCode) return null;
              return cur;
            }
          }

          // If none of the allowed codes exist in app_store.currencies, don't switch.
          return null;
        };
        /*

        1- before creating the payment
            1- check if there is prepayment amount and the user chose an online payment
                - if user currency diff than payment method currency
                    -   check availability with the payment method currency
                        if payment method have multiple currencies
                        check which one is the hotel currency
                        if didn't find any choose the first one
                    - recalculate the new prepayment amount;
                    - do payment

            
        */
        const mostEffectiveCurrency = getMostEffectiveCurrency();
        console.log({ mostEffectiveCurrency, paymentAmount });
        if (paymentAmount > 0 && mostEffectiveCurrency) {
          const variationService = new VariationService();
          if (normalize(mostEffectiveCurrency.code) !== (normalize(app_store.userPreferences?.currency_id) || 'usd')) {
            //check availability
            const data = await this.propertyService.getExposedBookingAvailability({
              propertyid: app_store.app_data.property_id,
              from_date: booking_store.bookingAvailabilityParams.from_date,
              to_date: booking_store.bookingAvailabilityParams.to_date,
              room_type_ids: [],
              adult_nbr: booking_store.bookingAvailabilityParams.adult_nbr,
              child_nbr: booking_store.bookingAvailabilityParams.child_nbr,
              language: app_store.userPreferences.language_id,
              currency_ref: mostEffectiveCurrency.code,
              is_in_loyalty_mode: booking_store.bookingAvailabilityParams.loyalty ? true : !!booking_store.bookingAvailabilityParams.coupon,
              promo_key: booking_store.bookingAvailabilityParams.coupon || '',
              is_in_agent_mode: !!booking_store.bookingAvailabilityParams.agent || false,
              agent_id: booking_store.bookingAvailabilityParams.agent?.id || 0,
              is_in_affiliate_mode: !!app_store.app_data.affiliate,
              affiliate_id: app_store.app_data.affiliate ? app_store.app_data.affiliate.id : null,
              update_store: false,
            });
            //recalculate the new prepayment amount
            let total = 0;
            for (const roomType of data.My_Result as RoomType[]) {
              const selectedRoomType = booking_store.ratePlanSelections[roomType.id] as IRoomTypeSelection | undefined;
              if (!selectedRoomType) continue;

              for (const ratePlan of roomType.rateplans) {
                const selectedRatePlan = selectedRoomType[ratePlan.id];
                if (!selectedRatePlan) continue;

                const { checkoutVariations, infant_nbr } = selectedRatePlan;
                checkoutVariations.forEach((checkoutVariation, index) => {
                  const baseVariation =
                    ratePlan.variations.find(
                      v => v.adult_nbr === checkoutVariation.adult_nbr && v.child_nbr === checkoutVariation.child_nbr && v.infant_nbr === checkoutVariation.infant_nbr,
                    ) ?? checkoutVariation;

                  if (!baseVariation) return;

                  const variation = variationService.getVariationBasedOnInfants({
                    baseVariation,
                    variations: ratePlan.variations,
                    infants: infant_nbr?.[index] ?? 0,
                  });

                  total += variation?.prepayment_amount_gross ?? 0;
                });
              }
            }

            paymentAmount = total;
          }
        }
        await this.processPayment({
          booking: result,
          paymentMethod: this.selectedPaymentMethod,
          paymentAmount,
          token,
          currency: (mostEffectiveCurrency || getCurrencyByCode(normalize(app_store.userPreferences?.currency_id) || 'usd')) as Currency,
        });
      }
    } catch (error) {
      console.error('Booking process failed:', error);
    }
  }

  private modifyConversionTag(tag: string) {
    const booking = booking_store.booking;
    tag = tag.replace(/\$\$total_price\$\$/g, booking.financial.total_amount.toString());
    tag = tag.replace(
      /\$\$total_roomnights\$\$/g,
      (getDateDifference(moment(booking.from_date, 'YYYY-MM-DD'), moment(booking.to_date, 'YYYY-MM-DD')) * calculateTotalRooms()).toString(),
    );
    tag = tag.replace(/\$\$booking_xref\$\$/g, booking.booking_nbr.toString());
    tag = tag.replace(/\$\$curr\$\$/g, app_store.userPreferences?.currency_id?.toString());
    tag = tag.replace(/\$\$cur_code\$\$/g, app_store.userPreferences?.currency_id?.toString());
    injectHTMLAndRunScript(tag, 'conversion_tag');
  }
  private async processPayment({
    currency,
    booking,
    paymentMethod,
    paymentAmount,
    token,
  }: {
    currency: Currency;
    booking: Booking;
    paymentMethod: AllowedPaymentMethod;
    paymentAmount: number;
    token: string;
  }) {
    let amountToBePayed = paymentAmount;
    if (amountToBePayed > 0) {
      await this.paymentService.GeneratePaymentCaller({
        token,
        params: {
          booking_nbr: booking.booking_nbr,
          amount: amountToBePayed,
          currency_id: currency.id,
          email: booking.guest.email,
          pgw_id: paymentMethod.id.toString(),
        },
        onRedirect: url => (window.location.href = url),
        onScriptRun: script => injectHTMLAndRunScript(script, 'conversion_tag'),
      });
    }
  }

  scrollToError() {
    if (this.errorElement) {
      this.errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => {
        window.scrollBy(0, -150);
      }, 500);
    }
  }

  render() {
    if (this.isLoading) {
      return (
        <div class={'flex min-h-screen flex-col'}>
          <ir-checkout-skeleton></ir-checkout-skeleton>
        </div>
      );
    }
    return (
      <Host>
        <main class="flex  w-full  flex-col justify-between gap-4   md:flex-row md:items-start">
          <section class="w-full space-y-4 md:max-w-4xl">
            <div class="flex items-center gap-2.5">
              <ir-button
                variants="icon"
                onButtonClick={e => {
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  this.routing.emit('booking');
                  clearCheckoutRooms();
                }}
                iconName={app_store.dir === 'RTL' ? 'angle_right' : ('angle_left' as any)}
              ></ir-button>
              <p class="text-2xl font-semibold">{localizedWords.entries.Lcz_CompleteYourBooking}</p>
            </div>
            {!app_store.is_signed_in && !app_store.app_data.hideGoogleSignIn && (
              <div>
                <ir-quick-auth></ir-quick-auth>
              </div>
            )}
            <div class={'space-y-8'}>
              <div>
                <ir-user-form ref={el => (this.userForm = el)} class="" errors={this.error && this.error.cause === 'user' ? this.error.issues : undefined}></ir-user-form>
              </div>
              <div>
                <ir-booking-details
                  ref={el => (this.bookingDetails = el)}
                  errors={this.error && this.error.cause === 'booking-details' ? this.error.issues : undefined}
                ></ir-booking-details>
              </div>
              <div>
                <ir-pickup ref={el => (this.pickupForm = el)} errors={this.error && this.error.cause === 'pickup' ? this.error.issues : undefined}></ir-pickup>
              </div>
            </div>
          </section>
          <section class="w-full md:sticky  md:top-20  md:flex md:max-w-md md:justify-end">
            <ir-booking-summary isBookingConfirmed={this.isBookingConfirmed} prepaymentAmount={this.prepaymentAmount} error={this.error}></ir-booking-summary>
          </section>
        </main>
        <ir-alert-dialog ref={el => (this.alertRef = el)}>
          <div slot="modal-title" class={'flex items-center gap-4 pb-2'}>
            {/* <ir-icons name="danger" class={'text-red-500'} svgClassName="size-6"></ir-icons> */}
            <h1 class={'text-lg font-semibold'}>{localizedWords?.entries?.Lcz_SomethingWentWrong ?? 'Something went wrong'}!</h1>
          </div>
          <p slot="modal-body">{localizedWords?.entries?.Lcz_BookingIsNotAvailable}</p>
          <div slot="modal-footer">
            {/* <ir-button label="Cancel" variants="outline" onButtonClick={() => this.alertRef.closeModal()}></ir-button> */}
            <ir-button
              label={localizedWords?.entries?.Lcz_GoBack}
              onButtonClick={() => {
                this.routing.emit('booking');
                clearCheckoutRooms();
              }}
            ></ir-button>
          </div>
        </ir-alert-dialog>
      </Host>
    );
  }
}
