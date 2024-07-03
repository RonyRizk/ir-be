import { Booking } from '@/models/booking.dto';
import { pages } from '@/models/common';
import { PickupFormData } from '@/models/pickup';
import { AllowedPaymentMethod } from '@/models/property';
import { IrUserFormData } from '@/models/user_form';
import { AuthService } from '@/services/api/auth.service';
import { PaymentService } from '@/services/api/payment.service';
import { PropertyService } from '@/services/api/property.service';
import app_store from '@/stores/app.store';
import booking_store, { calculateTotalCost, validateBooking } from '@/stores/booking';
import { checkout_store } from '@/stores/checkout.store';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { getDateDifference } from '@/utils/utils';
import { Component, Host, Listen, State, h, Event, EventEmitter } from '@stencil/core';
import { ZodError, ZodIssue } from 'zod';

@Component({
  tag: 'ir-checkout-page',
  styleUrl: 'ir-checkout-page.css',
  scoped: true,
})
export class IrCheckoutPage {
  @State() isLoading = false;
  @State() error:
    | {
        cause: 'user' | 'pickup';
        issues: Record<string, ZodIssue>;
      }
    | {
        cause: 'booking-details' | 'booking-summary';
        issues: string;
      };

  private propertyService = new PropertyService();
  private paymentService = new PaymentService();
  private authService = new AuthService();

  @Event() routing: EventEmitter<pages>;
  userForm: HTMLIrUserFormElement;
  bookingDetails: HTMLIrBookingDetailsElement;
  pickupForm: HTMLIrPickupElement;
  errorElement: HTMLElement;

  componentWillLoad() {
    const token = app_store.app_data.token;
    this.propertyService.setToken(token);
    this.paymentService.setToken(token);
    this.authService.setToken(token);
  }

  @Listen('bookingClicked')
  async handleBooking(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.resetErrorState();

    if (!this.validateUserForm() || !this.validateBookingDetails() || !this.validatePickupForm() || this.validatePolicyAcceptance()) {
      this.isLoading = false;
      return;
    }
    await this.processBooking();
  }
  validatePolicyAcceptance(): boolean {
    if (checkout_store.agreed_to_services) {
      return false;
    }
    this.error = { cause: 'booking-summary', issues: 'unchecked aggreement' };
    return true;
  }

  private resetErrorState() {
    this.error = undefined;
    this.isLoading = true;
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

  handleError(cause: 'pickup' | 'user', error: ZodError<any>) {
    let issues: Record<string, ZodIssue> = {};
    error.issues.map(issue => (issues[issue.path[0]] = issue));
    this.error = {
      cause,
      issues,
    };
    this.errorElement = cause === 'pickup' ? this.pickupForm : this.userForm;
    this.scrollToError();
  }

  private async processBooking() {
    try {
      const result = await this.propertyService.bookUser();
      booking_store.booking = result;
      const conversionTag = app_store.property?.tags.find(t => t.key === 'conversion');
      if (conversionTag && conversionTag.value) {
        this.modifyConversionTag(conversionTag.value);
      }
      const currentPayment = app_store.property.allowed_payment_methods.find(p => p.code === checkout_store.payment?.code);
      if (!currentPayment || !currentPayment?.is_payment_gateway) {
        app_store.invoice = {
          email: booking_store.booking.guest.email,
          booking_number: booking_store.booking.booking_nbr,
        };
        this.routing.emit('invoice');
      } else {
        await this.processPayment(result, currentPayment);
      }
    } catch (error) {
      console.error('Booking process failed:', error);
    } finally {
      this.isLoading = false;
    }
  }
  private modifyConversionTag(tag: string) {
    const booking = booking_store.booking;
    tag = tag.replace(/\$\$total_price\$\$/g, booking.financial.total_amount.toString());
    tag = tag.replace(/\$\$length_of_stay\$\$/g, getDateDifference(new Date(booking.from_date), new Date(booking.to_date)).toString());
    tag = tag.replace(/\$\$booking_xref\$\$/g, booking.booking_nbr.toString());
    tag = tag.replace(/\$\$curr\$\$/g, booking.currency.code.toString());
    this.runScriptAndRemove(tag);
  }
  private async processPayment(bookingResult: Booking, currentPayment: AllowedPaymentMethod) {
    let token = app_store.app_data.token;
    if (!app_store.is_signed_in) {
      token = await this.authService.login(
        {
          option: 'direct',
          params: {
            email: bookingResult.guest.email,
            booking_nbr: bookingResult.booking_nbr,
          },
        },
        false,
      );
    }
    const { prePaymentAmount } = calculateTotalCost();
    if (prePaymentAmount > 0) {
      await this.paymentService.GeneratePaymentCaller({
        token,
        params: {
          booking_nbr: bookingResult.booking_nbr,
          amount: prePaymentAmount,
          currency_id: bookingResult.currency.id,
          email: bookingResult.guest.email,
          pgw_id: currentPayment.id.toString(),
        },
        onRedirect: url => (window.location.href = url),
        onScriptRun: script => this.runScriptAndRemove(script),
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

  runScriptAndRemove(scriptContent: string): void {
    const script = document.createElement('script');
    script.textContent = scriptContent;
    document.body.appendChild(script);
    document.body.removeChild(script);
  }
  render() {
    console.log(isRequestPending('/Get_Setup_Entries_By_TBL_NAME_MULTI') || isRequestPending('/Get_Exposed_Countries'));
    if (isRequestPending('/Get_Setup_Entries_By_TBL_NAME_MULTI') || isRequestPending('/Get_Exposed_Countries')) {
      return <ir-checkout-skeleton></ir-checkout-skeleton>;
    }
    return (
      <Host>
        <main class="flex w-full  flex-col justify-between gap-4  md:flex-row md:items-start">
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
              <p class="text-2xl font-semibold">Complete your booking</p>
            </div>
            {!app_store.is_signed_in && (
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
            <ir-booking-summary error={this.error && this.error.cause === 'booking-summary' ? true : false} isLoading={this.isLoading}></ir-booking-summary>
          </section>
        </main>
      </Host>
    );
  }
}
