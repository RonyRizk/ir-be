import { Component, Event, EventEmitter, Fragment, h, Method, Prop, State } from '@stencil/core';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { PaymentService, TBookingInfo } from '@/services/api/payment.service';
import { formatAmount } from '@/utils/utils';
import { Booking } from '@/models/booking.dto';
import localizedWords from '@/stores/localization.store';
import app_store from '@/stores/app.store';
import { isBefore, isSameDay } from 'date-fns';

@Component({
  tag: 'ir-booking-cancellation',
  styleUrl: 'ir-booking-cancellation.css',
  shadow: true,
})
export class IrBookingCancellation {
  @Prop() booking_nbr: string;
  @Prop() cancellation: string;
  @Prop() cancellation_policies: TBookingInfo[] = [];
  @Prop() property_id: number;
  @Prop() currency: { code: string; id: number };
  @Prop() booking: Booking;
  @State() paymentAmount: number;
  @State() isLoading: boolean;
  @State() isOpen = false;
  @State() policies: TBookingInfo[] = [];

  @Event() openChange: EventEmitter<boolean>;
  @Event() cancellationResult: EventEmitter<{ state: 'failed' | 'success'; booking_nbr: string }>;

  private alertDialog: HTMLIrAlertDialogElement;
  private paymentService = new PaymentService();

  async setOverdueAmount() {
    try {
      const res = await this.paymentService.GetExposedApplicablePolicies({
        book_date: new Date(),
        params: {
          booking_nbr: this.booking_nbr,
          property_id: this.booking.property.id,
          room_type_id: 0,
          rate_plan_id: 0,
          currency_id: this.booking.currency.id,
          language: app_store.userPreferences.language_id,
        },
      });
      const { data } = res;
      const cancelationBrackets = data.find(d => d.type === 'cancelation');
      const book_date = new Date();
      if (cancelationBrackets) {
        this.paymentAmount = cancelationBrackets.brackets.find(b => isBefore(new Date(b.due_on), book_date) || isSameDay(new Date(b.due_on), book_date))?.gross_amount ?? 0;
      }
      // const res = await this.paymentService.getExposedCancelationDueAmount({
      //   booking_nbr: this.booking_nbr,
      //   currency_id: this.currency.id,
      // });

      // const overdueResult = res.find(f => f.type === 'overdue');
      // if (overdueResult) {
      //   this.paymentAmount = overdueResult.amount;
      // }
    } catch (error) {
      console.error('Error fetching overdue amount:', error);
    }
  }
  async init() {
    try {
      this.policies = this.cancellation_policies;
      const requests = [];
      if (this.cancellation_policies.length === 0 && this.booking) {
        const prepaymentPromise = this.paymentService.getBookingPrepaymentAmount(this.booking);
        requests.push(prepaymentPromise);
      }
      const overdueAmountPromise = this.setOverdueAmount();
      requests.push(overdueAmountPromise);
      const results = await Promise.all(requests);
      if (this.cancellation_policies.length === 0 && this.booking) {
        const prepaymentResult = results.length > 1 ? results[0] : null;
        if (prepaymentResult) {
          this.policies = prepaymentResult.cancelation_policies ?? this.policies;
        }
      }
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }
  @Method()
  async openDialog() {
    this.openChange.emit(true);
    this.alertDialog.openModal();
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
            {isPending ? (
              <div class="h-24">
                <ir-skeleton class="mb-2.5 h-4 w-60"></ir-skeleton>
              </div>
            ) : (
              <Fragment>
                {this.paymentAmount > 0 ? (
                  <p class="mb-2.5 font-semibold">{localizedWords.entries.Lcz_IfYouCancelNow.replace('%1', formatAmount(this.paymentAmount, this.currency?.code || 'usd'))}.</p>
                ) : (
                  <p class="mb-2.5 font-semibold">{localizedWords.entries.Lcz_NoPenalityIsApplied}</p>
                )}
                <button
                  onClick={() => {
                    this.isOpen = !this.isOpen;
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
                  await this.paymentService.RequestBookingCancellation(this.booking_nbr);
                  this.cancellationResult.emit({ state: 'success', booking_nbr: this.booking_nbr });
                  this.closeAlertDialog();
                } catch (error) {
                  console.error(error);
                  this.cancellationResult.emit({ state: 'failed', booking_nbr: this.booking_nbr });
                }
              }}
            ></ir-button>
          </div>
        </ir-alert-dialog>
      </div>
    );
  }
}
