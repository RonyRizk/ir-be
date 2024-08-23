import app_store from '@/stores/app.store';
import booking_store from '@/stores/booking';
import localizedWords from '@/stores/localization.store';
import { validateAgentCode } from '@/utils/utils';
import { Component, Host, h, Event, EventEmitter, State, Method } from '@stencil/core';

@Component({
  tag: 'ir-booking-code',
  styleUrl: 'ir-booking-code.css',
  shadow: true,
})
export class IrBookingCode {
  @State() code: string;
  @State() validationMessage: { error: boolean; message: string };
  @Event() closeDialog: EventEmitter<null>;
  @Event() resetBooking: EventEmitter<string>;

  handleSubmit(e: Event) {
    e.preventDefault();
    if (app_store.app_data.isAgentMode) {
      return this.clearAgent();
    }
    this.validationMessage = null;
    if (!validateAgentCode(this.code)) {
      return (this.validationMessage = { error: true, message: localizedWords.entries.Lcz_InvalidAgentCode });
    }
    this.validationMessage = { error: false, message: this.code };
    this.code = '';
    this.closeDialog.emit(null);
    this.resetBooking.emit('partialReset');
  }
  @Method()
  async clearAgent() {
    if (!app_store.app_data.isAgentMode) {
      return;
    }
    app_store.app_data = {
      ...app_store.app_data,
      isAgentMode: false,
    };
    booking_store.bookingAvailabilityParams = {
      ...booking_store.bookingAvailabilityParams,
      agent: null,
      agent_code: null,
    };
    this.closeDialog.emit(null);
    this.resetBooking.emit('partialReset');
  }
  render() {
    return (
      <Host>
        <form onSubmit={this.handleSubmit.bind(this)} class="p-4 sm:p-6">
          <h1 class="title">{localizedWords.entries.Lcz_HaveAgentorCoporate} </h1>
          {/* <p class="Supporting-text mb-8">If you have a private or corporate booking code available, you can enter it below to unlock special rates:</p> */}

          <ir-input
            value={this.code}
            error={this.validationMessage?.error}
            onTextChanged={e => (this.code = e.detail)}
            autofocus
            inputId="booking_code"
            placeholder={localizedWords.entries.Lcz_BookingCode}
            mode="default"
          ></ir-input>

          {this.validationMessage?.error && <p class="text-red-500">{this.validationMessage.message}</p>}
          <div class="mt-8 flex w-full flex-col items-center gap-4 md:flex-row-reverse">
            <ir-button type="submit" size="md" label={localizedWords.entries.Lcz_Apply} class="w-full md:w-fit"></ir-button>
            <ir-button
              size="md"
              onButtonClick={() => this.closeDialog.emit(null)}
              variants="outline"
              type="button"
              label={localizedWords.entries.Lcz_Cancel}
              class={'w-full md:w-fit'}
            ></ir-button>
          </div>
        </form>
      </Host>
    );
  }
}
