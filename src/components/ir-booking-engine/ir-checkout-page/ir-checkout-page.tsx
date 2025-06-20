import { Booking } from '@/models/booking.dto';
import { CheckoutErrors, pages } from '@/models/common';
import { PickupFormData } from '@/models/pickup';
import { AllowedPaymentMethod } from '@/models/property';
import { IrUserFormData } from '@/models/user_form';
import { AuthService } from '@/services/api/auth.service';
import { PaymentService } from '@/services/api/payment.service';
import { PropertyService } from '@/services/api/property.service';
import app_store from '@/stores/app.store';
import booking_store, { calculateTotalRooms, clearCheckoutRooms, validateBooking } from '@/stores/booking';
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
        const paymentAmount = this.prepaymentAmount;
        await this.processPayment(result, this.selectedPaymentMethod, paymentAmount, token);
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
  private async processPayment(bookingResult: Booking, currentPayment: AllowedPaymentMethod, paymentAmount: number, token) {
    let amountToBePayed = paymentAmount;
    if (amountToBePayed > 0) {
      await this.paymentService.GeneratePaymentCaller({
        token,
        params: {
          booking_nbr: bookingResult.booking_nbr,
          amount: amountToBePayed,
          currency_id: app_store.currencies.find(a => a.code.toLowerCase() === (app_store.userPreferences.currency_id.toLowerCase() || 'usd')).id,
          email: bookingResult.guest.email,
          pgw_id: currentPayment.id.toString(),
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
