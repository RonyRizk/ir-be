import { Component, Event, EventEmitter, Fragment, h, Method, Prop, State } from '@stencil/core';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { PaymentService, TBookingInfo } from '@/services/api/payment.service';
import { Booking } from '@/models/booking.dto';
import localizedWords from '@/stores/localization.store';
import app_store from '@/stores/app.store';
import { BookingService } from '@/services/api/booking.service';

@Component({
  tag: 'ir-booking-cancellation',
  styleUrl: 'ir-booking-cancellation.css',
  shadow: true,
})
export class IrBookingCancellation {
  @Prop() property_id: number;
  @Prop() booking: Booking;
  @State() isLoading: boolean;
  @State() isOpen = false;
  @State() policies: TBookingInfo[] = [];
  @State() cancellationMessage: string;

  @Event() openChange: EventEmitter<boolean>;
  @Event() cancellationResult: EventEmitter<{ state: 'failed' | 'success'; booking_nbr: string }>;

  private alertDialog: HTMLIrAlertDialogElement;
  private paymentService = new PaymentService();
  private bookingService = new BookingService();

  async init() {
    try {
      if (!this.booking) {
        throw new Error('Missing Booking');
      }
      this.policies = [];
      this.cancellationMessage = await this.bookingService.GetPenaltyStatement({
        booking_nbr: this.booking.booking_nbr,
        currency_id: this.booking.currency.id,
        language: app_store.userPreferences.language_id,
      });
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }
  private async fetchRatePlansMoreDetails() {
    if (this.policies.length > 0) {
      return;
    }
    const results = await this.paymentService.getBookingPrepaymentAmount(this.booking);
    console.log(results);
    if (results) {
      this.policies = results.cancelation_policies;
    }
  }
  @Method()
  async openDialog() {
    this.openChange.emit(true);
    this.alertDialog.openModal();
    console.log(this.booking);
    if (!this.booking) {
      throw new Error('Missing booking');
    }
    await this.init();
  }

  private closeAlertDialog() {
    this.alertDialog.closeModal();
    this.openChange.emit(false);
  }

  render() {
    const isPending = isRequestPending('/Get_Exposed_Applicable_Policies');
    // const isPending = isRequestPending('/Get_Exposed_Cancelation_Due_Amount');
    return (
      <div>
        <ir-alert-dialog
          ref={el => (this.alertDialog = el)}
          onOpenChange={e => {
            if (!e.detail && this.isOpen) {
              this.isOpen = false;
            }
          }}
        >
          <h2 slot="modal-title" class="text-lg font-medium">
            {localizedWords.entries.Lcz_BookingCancellation}
          </h2>
          <div class="py-3" slot="modal-body">
            {isRequestPending('/Get_Penalty_Statement') ? (
              <div class="h-24">
                <ir-skeleton class="mb-2.5 h-4 w-60"></ir-skeleton>
              </div>
            ) : (
              <Fragment>
                {/* {this.paymentAmount > 0 ? (
                  <p class="mb-2.5 font-semibold">{localizedWords.entries.Lcz_IfYouCancelNow.replace('%1', formatAmount(this.paymentAmount, this.currency?.code || 'usd'))}.</p>
                ) : (
                  <p class="mb-2.5 font-semibold">{localizedWords.entries.Lcz_NoPenalityIsApplied}</p>
                )} */}
                <p class="mb-2.5">{this.cancellationMessage}</p>
                <button
                  onClick={() => {
                    this.isOpen = !this.isOpen;
                    this.fetchRatePlansMoreDetails();
                  }}
                  class="flex w-full items-center justify-between rounded-md  py-1 "
                >
                  <p>{localizedWords.entries.Lcz_MoreDetails}</p>
                  <ir-icons name={this.isOpen ? 'angle_up' : 'angle_down'} svgClassName="h-3"></ir-icons>
                </button>
                {this.isOpen && (
                  <Fragment>
                    {isRequestPending('/Get_Exposed_Applicable_Policies') ? (
                      <div class="h-20 w-full">
                        <ir-skeleton class="mb-2.5 h-20  w-60"></ir-skeleton>
                      </div>
                    ) : (
                      <div class={'divide-y py-2'}>
                        {this.policies?.map(d => (
                          <div class="space-y-1.5 py-2.5">
                            <p class={'font-medium'}>
                              {d.rt_name} {d.rp_name}
                            </p>
                            <p class="text-xs text-gray-500">{d.statement}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Fragment>
                )}
              </Fragment>
            )}
          </div>

          <div slot="modal-footer">
            <ir-button
              label={localizedWords.entries.Lcz_Cancel}
              variants="outline"
              onButtonClick={() => {
                this.closeAlertDialog();
              }}
              size="md"
            ></ir-button>
            <ir-button
              disabled={isPending}
              size="md"
              label={localizedWords.entries.Lcz_AcceptAndConfirm}
              isLoading={isRequestPending('/Request_Booking_Cancelation')}
              onButtonClick={async () => {
                try {
                  await this.paymentService.requestBookingCancellation(this.booking.booking_nbr);
                  this.cancellationResult.emit({ state: 'success', booking_nbr: this.booking.booking_nbr });
                  this.closeAlertDialog();
                } catch (error) {
                  console.error(error);
                  this.cancellationResult.emit({ state: 'failed', booking_nbr: this.booking.booking_nbr });
                }
              }}
            ></ir-button>
          </div>
        </ir-alert-dialog>
      </div>
    );
  }
}
