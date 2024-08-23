import { Component, Event, EventEmitter, Fragment, h, Method, Prop, State } from '@stencil/core';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { PaymentService, TBookingInfo } from '@/services/api/payment.service';
import app_store from '@/stores/app.store';
import { formatAmount } from '@/utils/utils';
import { Booking } from '@/models/booking.dto';

@Component({
  tag: 'ir-booking-cancelation',
  styleUrl: 'ir-booking-cancelation.css',
  shadow: true,
})
export class IrBookingCancelation {
  @Prop() booking_nbr: string;
  @Prop() cancelation: string;
  @Prop() cancelation_policies: TBookingInfo[] = [];
  @Prop() currency: { code: string; id: number };
  @Prop() booking: Booking;
  @State() paymentAmount: number;
  @State() isLoading: boolean;
  @State() isOpen = false;
  @State() policies: TBookingInfo[] = [];

  @Event() openChange: EventEmitter<boolean>;
  @Event() cancelationResult: EventEmitter<{ state: 'failed' | 'success'; booking_nbr: string }>;

  private alertDialog: HTMLIrAlertDialogElement;
  private paymentService = new PaymentService();

  componentWillLoad() {
    this.paymentService.setToken(app_store.app_data.token);
  }
  async setOverdueAmount() {
    try {
      const res = await this.paymentService.getExposedCancelationDueAmount({
        booking_nbr: this.booking_nbr,
        currency_id: this.currency.id,
      });

      const overdueResult = res.find(f => f.type === 'overdue');
      if (overdueResult) {
        this.paymentAmount = overdueResult.amount;
      }
    } catch (error) {
      console.error('Error fetching overdue amount:', error);
    }
  }
  async init() {
    try {
      this.policies = this.cancelation_policies;
      const requests = [];
      if (this.cancelation_policies.length === 0 && this.booking) {
        const prepaymentPromise = this.paymentService.getBookingPrepaymentAmount(this.booking);
        requests.push(prepaymentPromise);
      }
      const overdueAmountPromise = this.setOverdueAmount();
      requests.push(overdueAmountPromise);
      const results = await Promise.all(requests);
      if (this.cancelation_policies.length === 0 && this.booking) {
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
    const isPending = isRequestPending('/Get_Exposed_Cancelation_Due_Amount');
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
            Booking Cancellation
          </h2>
          <div class="py-3" slot="modal-body">
            {isPending ? (
              <div class="h-24">
                <ir-skeleton class="mb-2.5 h-4 w-60"></ir-skeleton>
              </div>
            ) : (
              <Fragment>
                {this.paymentAmount > 0 ? (
                  <p class="mb-2.5 font-semibold">{`If you cancel now, the penalty will be ${formatAmount(this.paymentAmount, this.currency?.code || 'usd')}.`}</p>
                ) : (
                  <p class="mb-2.5 font-semibold">No penalty is applied if you cancel now.</p>
                )}
                <button
                  onClick={() => {
                    this.isOpen = !this.isOpen;
                  }}
                  class="flex w-full items-center justify-between rounded-md  py-1 "
                >
                  <p>More details</p>
                  <ir-icons name={this.isOpen ? 'angle_up' : 'angle_down'} svgClassName="h-3"></ir-icons>
                </button>
                {this.isOpen && (
                  <Fragment>
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
                  </Fragment>
                )}
              </Fragment>
            )}
          </div>

          <div slot="modal-footer">
            <ir-button
              label="Cancel"
              variants="outline"
              onButtonClick={() => {
                this.closeAlertDialog();
              }}
              size="md"
            ></ir-button>
            <ir-button
              disabled={isPending}
              size="md"
              label="Accept & Confirm"
              isLoading={isRequestPending('/Request_Booking_Cancelation')}
              onButtonClick={async () => {
                try {
                  await this.paymentService.RequestBookingCancelation(this.booking_nbr);
                  this.cancelationResult.emit({ state: 'success', booking_nbr: this.booking_nbr });
                  this.closeAlertDialog();
                } catch (error) {
                  console.error(error);
                  this.cancelationResult.emit({ state: 'failed', booking_nbr: this.booking_nbr });
                }
              }}
            ></ir-button>
          </div>
        </ir-alert-dialog>
      </div>
    );
  }
}
