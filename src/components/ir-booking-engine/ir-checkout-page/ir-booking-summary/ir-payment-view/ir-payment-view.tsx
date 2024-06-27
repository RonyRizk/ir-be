import app_store from '@/stores/app.store';
import { checkout_store, ICardProcessingWithCVC, ICardProcessingWithoutCVC } from '@/stores/checkout.store';
import localizedWords from '@/stores/localization.store';
import { Component, State, h } from '@stencil/core';
import IMask from 'imask';
@Component({
  tag: 'ir-payment-view',
  styleUrl: 'ir-payment-view.css',
  shadow: true,
})
export class IrPaymentView {
  @State() selectedPaymentMethod: string;

  componentWillLoad() {
    this.selectedPaymentMethod = app_store.property?.allowed_payment_methods[0].code;
    if (!checkout_store.payment) {
      checkout_store.payment = {
        code: this.selectedPaymentMethod,
      };
    }
  }
  private getExpiryMask() {
    const currentYear = new Date().getFullYear() % 100;
    return {
      mask: 'MM/YY',
      blocks: {
        MM: {
          mask: IMask.MaskedRange,
          from: 1,
          to: 12,
          maxLength: 2,
          placeholderChar: 'M',
        },
        YY: {
          mask: IMask.MaskedRange,
          from: currentYear,
          to: 99,
          maxLength: 2,
          placeholderChar: 'Y',
        },
      },
      lazy: false,
      placeholderChar: '_',
    };
  }
  renderPaymentMethod() {
    if (app_store.property.allowed_payment_methods.length === 0) {
      return;
    }
    const method = app_store.property?.allowed_payment_methods.find(apm => apm.code === this.selectedPaymentMethod);
    if (this.selectedPaymentMethod === '001' || this.selectedPaymentMethod === '004')
      return (
        <div class="flex w-full gap-4" key={method.code}>
          <div class={'flex-1 space-y-4'}>
            <fieldset>
              <ir-input
                placeholder=""
                onTextChanged={e => {
                  checkout_store.payment = { ...checkout_store.payment, cardHolderName: e.detail } as ICardProcessingWithoutCVC | ICardProcessingWithCVC;
                }}
                label={localizedWords.entries.Lcz_NameOnCard}
                class="w-full"
              ></ir-input>
            </fieldset>
            <ir-credit-card-input
              onCreditCardChange={e => {
                checkout_store.payment = { ...checkout_store.payment, cardNumber: e.detail } as ICardProcessingWithoutCVC | ICardProcessingWithCVC;
              }}
            ></ir-credit-card-input>
            <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <fieldset class="w-full">
                <ir-input
                  type="text"
                  value=""
                  placeholder="MM/YY"
                  mask={this.getExpiryMask()}
                  label={localizedWords.entries.Lcz_ExpirationDate}
                  class="w-full"
                  rightIcon
                  onTextChanged={e => {
                    checkout_store.payment = { ...checkout_store.payment, expiry_month: e.detail, expiry_year: e.detail } as ICardProcessingWithoutCVC | ICardProcessingWithCVC;
                  }}
                >
                  <svg slot="right-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M2 7C2 6.20435 2.31607 5.44129 2.87868 4.87868C3.44129 4.31607 4.20435 4 5 4H19C19.7956 4 20.5587 4.31607 21.1213 4.87868C21.6839 5.44129 22 6.20435 22 7V8H2V7ZM2 10V17C2 17.7956 2.31607 18.5587 2.87868 19.1213C3.44129 19.6839 4.20435 20 5 20H19C19.7956 20 20.5587 19.6839 21.1213 19.1213C21.6839 18.5587 22 17.7956 22 17V10H2ZM7 12C6.73478 12 6.48043 12.1054 6.29289 12.2929C6.10536 12.4804 6 12.7348 6 13C6 13.2652 6.10536 13.5196 6.29289 13.7071C6.48043 13.8946 6.73478 14 7 14H12C12.2652 14 12.5196 13.8946 12.7071 13.7071C12.8946 13.5196 13 13.2652 13 13C13 12.7348 12.8946 12.4804 12.7071 12.2929C12.5196 12.1054 12.2652 12 12 12H7Z"
                      fill="#EAECF0"
                    />
                    <rect x="14.5" y="11.5" width="6" height="3" rx="0.5" stroke="#FE4F42" />
                  </svg>
                </ir-input>
              </fieldset>
              <fieldset class="w-full">
                <ir-input
                  label={localizedWords.entries.Lcz_SecurityCode}
                  maxlength={4}
                  tooltip={localizedWords.entries.Lcz_SecurityCodeHint}
                  placeholder=""
                  onTextChanged={e => {
                    checkout_store.payment = { ...checkout_store.payment, cvc: e.detail } as ICardProcessingWithCVC;
                  }}
                  class="w-full"
                  rightIcon
                >
                  <svg slot="right-icon" width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 3C0 1.34315 1.34315 0 3 0H17C18.6569 0 20 1.34315 20 3V13C20 14.6569 18.6569 16 17 16H3C1.34315 16 0 14.6569 0 13V3Z" fill="#EAECF0" />
                    <path d="M2 8C2 7.44772 2.44772 7 3 7H17C17.5523 7 18 7.44772 18 8C18 8.55228 17.5523 9 17 9H3C2.44772 9 2 8.55228 2 8Z" fill="#8B8B8B" />
                    <path d="M2 4C2 3.44772 2.44772 3 3 3H5C5.55228 3 6 3.44772 6 4C6 4.55228 5.55228 5 5 5H3C2.44772 5 2 4.55228 2 4Z" fill="white" />
                    <path d="M10 11C10 10.4477 10.4477 10 11 10H15C15.5523 10 16 10.4477 16 11V13C16 13.5523 15.5523 14 15 14H11C10.4477 14 10 13.5523 10 13V11Z" fill="#FE4F42" />
                    <path d="M11 11H15V13H11V11Z" fill="#EAECF0" />
                  </svg>
                </ir-input>
              </fieldset>
            </div>
          </div>
        </div>
      );
    if (this.selectedPaymentMethod === '005') {
      return (
        <div class="flex w-full gap-4">
          <div class="flex-1 space-y-1.5">
            <p>{method.description}</p>
            <p class="text-xs text-gray-700">{method.data?.map(d => <span key={d.key}>{d.value}</span>)}</p>
          </div>
        </div>
      );
    }
  }
  handlePaymentSelectionChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const payment_code = e.detail;
    this.selectedPaymentMethod = payment_code;
    checkout_store.payment.code = payment_code;
  }
  renderPaymentOptions() {
    const paymentLength = app_store.property.allowed_payment_methods.length;
    if (paymentLength === 0) {
      return <p class="text-center">No deposit required</p>;
    }
    if (paymentLength > 1) {
      return (
        <ir-select
          variant="double-line"
          label={localizedWords.entries.Lcz_SelectYourPaymentMethod}
          data={app_store.property?.allowed_payment_methods.map(apm => ({
            id: apm.code,
            value: apm.is_payment_gateway ? `Card payment with ${apm.description}` : apm.description,
          }))}
          onValueChange={this.handlePaymentSelectionChange.bind(this)}
        ></ir-select>
      );
    }
    const paymentOption = app_store.property.allowed_payment_methods[0];
    if (paymentOption.is_payment_gateway) {
      return <p class="text-center">Card payment with {paymentOption.description} </p>;
    }
    return null;
  }

  render() {
    return (
      <div class="w-full space-y-4 rounded-md border border-solid bg-white  p-4">
        {this.renderPaymentOptions()}
        {this.renderPaymentMethod()}
      </div>
    );
  }
}
