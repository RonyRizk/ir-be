import { Component, Event, EventEmitter, h, Method, Prop } from '@stencil/core';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { PaymentService } from '@/services/api/payment.service';
import app_store from '@/stores/app.store';

@Component({
  tag: 'ir-booking-cancelation',
  styleUrl: 'ir-booking-cancelation.css',
  shadow: true,
})
export class IrBookingCancelation {
  @Prop() booking_nbr: string;
  @Prop() cancelation: string;

  @Event() openChange: EventEmitter<boolean>;
  @Event() cancelationResult: EventEmitter<{ state: 'failed' | 'success'; booking_nbr: string }>;

  private alertDialog: HTMLIrAlertDialogElement;
  private paymentService = new PaymentService();

  componentWillLoad() {
    this.paymentService.setToken(app_store.app_data.token);
  }

  @Method()
  async openDialog() {
    this.openChange.emit(true);
    this.alertDialog.openModal();
  }

  private closeAlertDialog() {
    this.alertDialog.closeModal();
    this.openChange.emit(false);
  }

  render() {
    return (
      <div>
        <ir-alert-dialog ref={el => (this.alertDialog = el)}>
          <h2 slot="modal-title" class="text-lg font-medium">
            Booking Cancellation
          </h2>
          <p slot="modal-body" class="py-3" innerHTML={this.cancelation}></p>
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
