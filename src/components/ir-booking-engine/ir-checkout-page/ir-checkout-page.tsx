import { Booking } from '@/models/booking.dto';
import { CheckoutErrors, pages } from '@/models/commun';
import { PickupFormData } from '@/models/pickup';
import { AllowedPaymentMethod } from '@/models/property';
import { IrUserFormData } from '@/models/user_form';
import { AuthService } from '@/services/api/auth.service';
import { PaymentService } from '@/services/api/payment.service';
import { PropertyService } from '@/services/api/property.service';
import app_store from '@/stores/app.store';
import booking_store, { IRatePlanSelection, validateBooking } from '@/stores/booking';
import { checkout_store } from '@/stores/checkout.store';
import localizedWords from '@/stores/localization.store';
import { destroyBookingCookie, detectCardType, getDateDifference, runScriptAndRemove } from '@/utils/utils';
import { ZCreditCardSchemaWithCvc } from '@/validators/checkout.validator';
import { Component, Host, Listen, State, h, Event, EventEmitter } from '@stencil/core';
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

  @Event() routing: EventEmitter<pages>;

  private propertyService = new PropertyService();
  private paymentService = new PaymentService();
  private authService = new AuthService();

  private userForm: HTMLIrUserFormElement;
  private bookingDetails: HTMLIrBookingDetailsElement;
  private pickupForm: HTMLIrPickupElement;
  private errorElement: HTMLElement;

  async componentWillLoad() {
    try {
      this.isLoading = true;
      const token = app_store.app_data.token;
      this.propertyService.setToken(token);
      this.paymentService.setToken(token);
      this.authService.setToken(token);
      await this.calculateTotalPrepaymentAmount();
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }
  private async calculateTotalPrepaymentAmount() {
    let list: { booking_nbr: string; ratePlanId: number; roomTypeId: number }[] = [];
    Object.keys(booking_store.ratePlanSelections).map(roomTypeId => {
      return Object.keys(booking_store.ratePlanSelections[roomTypeId]).map(ratePlanId => {
        const r: IRatePlanSelection = booking_store.ratePlanSelections[roomTypeId][ratePlanId];
        if (r.reserved === 0) {
          return null;
        }
        list.push({ booking_nbr: booking_store.fictus_booking_nbr.nbr, ratePlanId: r.ratePlan.id, roomTypeId: r.roomtype.id });
      });
    });
    let requests = await Promise.all(
      list.map(l =>
        this.paymentService.GetExposedApplicablePolicies({
          token: app_store.app_data.token,
          book_date: new Date(),
          params: {
            booking_nbr: l.booking_nbr,
            currency_id: app_store.currencies.find(c => c.code.toLowerCase() === (app_store.userPreferences.currency_id.toLowerCase() || 'usd')).id,
            language: app_store.userPreferences.language_id,
            rate_plan_id: l.ratePlanId,
            room_type_id: l.roomTypeId,
            property_id: app_store.property.id,
          },
        }),
      ),
    );
    this.prepaymentAmount = requests.reduce((prev, curr) => {
      let total = 1;
      const roomtype = booking_store.ratePlanSelections[curr.room_type_id];
      if (roomtype) {
        const ratePlan = roomtype[curr.rate_plan_id];
        if (ratePlan) {
          total = ratePlan.reserved;
        }
      }
      return (prev + curr.amount) * total;
    }, 0);
    // this.prepaymentAmount = 0;
    checkout_store.prepaymentAmount = this.prepaymentAmount;
  }
  @Listen('bookingClicked')
  async handleBooking(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.resetErrorState();

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
    this.error = { cause: 'booking-summary', issues: 'unchecked aggreement' };
    return true;
  }

  private validatePayment(): boolean {
    const currentPayment = app_store.property.allowed_payment_methods.find(p => p.code === checkout_store.payment?.code);
    this.selectedPaymentMethod = currentPayment;

    if (!currentPayment && this.prepaymentAmount > 0) {
      return false;
    }
    if (currentPayment.is_payment_gateway || currentPayment.code === '000' || currentPayment.code === '005') {
      return true;
    }
    try {
      ZCreditCardSchemaWithCvc.parse({
        cardNumber: (checkout_store.payment as any)?.cardNumber?.replace(/ /g, ''),
        cardHolderName: (checkout_store.payment as any).cardHolderName,
        expiryDate: (checkout_store.payment as any)?.expiry_month,
        cvc: (checkout_store.payment as any)?.cvc,
      });
      const cardType = detectCardType((checkout_store.payment as any)?.cardNumber?.replace(/ /g, ''));
      if (!app_store.property.allowed_cards.find(c => c.name.toLowerCase().includes(cardType?.toLowerCase()))) {
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
        console.log(error.errors);
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

      booking_store.booking = result;
      const conversionTag = app_store.property?.tags.find(t => t.key === 'conversion');
      if (conversionTag && conversionTag.value) {
        this.modifyConversionTag(conversionTag.value);
      }

      if (!this.selectedPaymentMethod || !this.selectedPaymentMethod?.is_payment_gateway) {
        app_store.invoice = {
          email: booking_store.booking.guest.email,
          booking_number: booking_store.booking.booking_nbr,
        };
        this.routing.emit('invoice');
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
    tag = tag.replace(/\$\$length_of_stay\$\$/g, getDateDifference(new Date(booking.from_date), new Date(booking.to_date)).toString());
    tag = tag.replace(/\$\$booking_xref\$\$/g, booking.booking_nbr.toString());
    tag = tag.replace(/\$\$curr\$\$/g, booking.currency.code.toString());
    runScriptAndRemove(tag);
  }
  private async processPayment(bookingResult: Booking, currentPayment: AllowedPaymentMethod, paymentAmount: number, token) {
    let amountToBePayed = paymentAmount;
    if (app_store.app_data.isFromGhs) {
      destroyBookingCookie();
    }
    if (amountToBePayed > 0) {
      await this.paymentService.GeneratePaymentCaller({
        token,
        params: {
          booking_nbr: bookingResult.booking_nbr,
          amount: amountToBePayed,
          currency_id: bookingResult.currency.id,
          email: bookingResult.guest.email,
          pgw_id: currentPayment.id.toString(),
        },
        onRedirect: url => (window.location.href = url),
        onScriptRun: script => runScriptAndRemove(script),
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
            <ir-booking-summary prepaymentAmount={this.prepaymentAmount} error={this.error}></ir-booking-summary>
          </section>
        </main>
      </Host>
    );
  }
}
