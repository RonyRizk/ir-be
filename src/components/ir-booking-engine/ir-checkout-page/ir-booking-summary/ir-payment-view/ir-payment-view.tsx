import app_store from '@/stores/app.store';
import booking_store from '@/stores/booking';
import { checkout_store, ICardProcessingWithCVC, ICardProcessingWithoutCVC } from '@/stores/checkout.store';
import localizedWords from '@/stores/localization.store';
import { ZCreditCardSchemaWithCvc } from '@/validators/checkout.validator';
import { Component, Prop, State, Watch, h } from '@stencil/core';
import IMask from 'imask';
import { ZodIssue } from 'zod';
@Component({
  tag: 'ir-payment-view',
  styleUrl: 'ir-payment-view.css',
  shadow: true,
})
export class IrPaymentView {
  @Prop() prepaymentAmount: number = 0;
  @Prop() errors: Record<string, ZodIssue>;
  @State() selectedPaymentMethod: string;
  @State() cardType: string = '';

  componentWillLoad() {
    this.setPaymentMethod();
    if (!checkout_store.payment) {
      checkout_store.payment = {
        code: this.selectedPaymentMethod,
      };
    }
  }

  @Watch('prepaymentAmount')
  handlePrePaymentAmount(newValue: number, oldValue: number) {
    if (newValue !== oldValue) {
      this.setPaymentMethod();
    }
  }

  private setPaymentMethod() {
    const paymentMethods = app_store.property?.allowed_payment_methods.filter(pm => pm.is_active) || [];
    let selectedMethodCode = null;
    if (
      (this.prepaymentAmount === 0 && paymentMethods.length === 1 && paymentMethods[0].is_payment_gateway) ||
      (this.prepaymentAmount === 0 && !paymentMethods.some(pm => !pm.is_payment_gateway))
    ) {
      return null;
    }

    if (paymentMethods.length > 0) {
      const [firstMethod, secondMethod] = paymentMethods;
      selectedMethodCode = firstMethod.code === '000' && secondMethod ? secondMethod.code : firstMethod.code;
    }
    this.selectedPaymentMethod = selectedMethodCode;
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
    if (this.selectedPaymentMethod === '000') {
      return <p class="text-center">{localizedWords.entries.Lcz_NoDepositRequired}</p>;
    }
    if (this.selectedPaymentMethod === '001' || this.selectedPaymentMethod === '004')
      return (
        <form class="flex w-full gap-4" key={method.code}>
          <div class={'flex-1 space-y-4'}>
            <fieldset>
              <ir-input
                placeholder=""
                onTextChanged={e => {
                  checkout_store.payment = { ...checkout_store.payment, cardHolderName: e.detail } as ICardProcessingWithoutCVC | ICardProcessingWithCVC;
                }}
                autocomplete="cc-name"
                data-state={this.errors?.cardHolderName ? 'error' : ''}
                label={localizedWords.entries.Lcz_NameOnCard}
                class="w-full"
                onInputBlur={e => {
                  const cardHolderNameSchema = ZCreditCardSchemaWithCvc.pick({ cardHolderName: true });
                  const cardHolderNameValidation = cardHolderNameSchema.safeParse({ cardHolderName: (checkout_store.payment as ICardProcessingWithCVC)?.cardHolderName });
                  const target: HTMLIrInputElement = e.target;
                  if (!cardHolderNameValidation.success) {
                    target.setAttribute('data-state', 'error');
                    target.setAttribute('aria-invalid', 'true');
                  } else {
                    if (target.hasAttribute('aria-invalid')) {
                      target.setAttribute('aria-invalid', 'false');
                    }
                  }
                }}
                onInputFocus={e => {
                  const target: HTMLIrInputElement = e.target;
                  if (target.hasAttribute('data-state')) target.removeAttribute('data-state');
                }}
              ></ir-input>
            </fieldset>
            <ir-credit-card-input
              data-state={this.errors?.cardNumber ? 'error' : ''}
              onCreditCardChange={e => {
                const { cardType, value } = e.detail;
                this.cardType = cardType;
                checkout_store.payment = { ...checkout_store.payment, cardNumber: value } as ICardProcessingWithoutCVC | ICardProcessingWithCVC;
              }}
            ></ir-credit-card-input>
            <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <fieldset class="w-full">
                <ir-input
                  autocomplete="cc-exp"
                  data-state={this.errors?.expiryDate ? 'error' : ''}
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
                  onInputBlur={e => {
                    const expiryDateSchema = ZCreditCardSchemaWithCvc.pick({ expiryDate: true });
                    const expiryDateValidation = expiryDateSchema.safeParse({ expiryDate: (checkout_store.payment as ICardProcessingWithCVC)?.expiry_month });
                    const target: HTMLIrInputElement = e.target;
                    if (!expiryDateValidation.success) {
                      target.setAttribute('data-state', 'error');
                      target.setAttribute('aria-invalid', 'true');
                    } else {
                      if (target.hasAttribute('aria-invalid')) {
                        target.setAttribute('aria-invalid', 'false');
                      }
                    }
                  }}
                  onInputFocus={e => {
                    const target: HTMLIrInputElement = e.target;
                    if (target.hasAttribute('data-state')) target.removeAttribute('data-state');
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
                  autocomplete="cc-csc"
                  onInputBlur={e => {
                    const cvcSchema = ZCreditCardSchemaWithCvc.pick({ cvc: true });
                    const cvcValidation = cvcSchema.safeParse({ cvc: (checkout_store.payment as ICardProcessingWithCVC)?.cvc });
                    const target: HTMLIrInputElement = e.target;
                    if (!cvcValidation.success) {
                      target.setAttribute('data-state', 'error');
                      target.setAttribute('aria-invalid', 'true');
                    } else {
                      if (target.hasAttribute('aria-invalid')) {
                        target.setAttribute('aria-invalid', 'false');
                      }
                    }
                  }}
                  onInputFocus={e => {
                    const target: HTMLIrInputElement = e.target;
                    if (target.hasAttribute('data-state')) target.removeAttribute('data-state');
                  }}
                  data-state={this.errors?.cvc ? 'error' : ''}
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
                  <svg class={'cursor-pointer'} slot="right-icon" width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <title>{localizedWords.entries.Lcz_SecurityCodeHint}</title>
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
        </form>
      );
    if (this.selectedPaymentMethod === '005') {
      return (
        <div class="flex w-full gap-4">
          <div class="flex-1 space-y-1.5">
            <p>{method.description}</p>
            <p
              class="text-xs text-gray-700"
              innerHTML={
                method.localizables?.find(d => d.language.code.toLowerCase() === app_store.userPreferences.language_id.toLowerCase())?.description ||
                method.localizables?.find(d => d.language.code.toLowerCase() === 'en')?.description
              }
            ></p>
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
    const paymentMethods = app_store.property.allowed_payment_methods.filter(p => p.is_active) ?? [];

    const paymentLength = paymentMethods.length;
    if ((this.prepaymentAmount === 0 && !paymentMethods.some(pm => !pm.is_payment_gateway)) || paymentLength === 0) {
      return <p class="text-center">{localizedWords.entries.Lcz_NoDepositRequired}</p>;
    }
    if (paymentLength === 1 && paymentMethods[0].is_payment_gateway) {
      return <p class={'text-center'}>{`${localizedWords.entries[`Lcz_Pay_${paymentMethods[0].code}`] ?? localizedWords.entries.Lcz_PayByCard}`}</p>;
    }
    // if (paymentLength === 1 && paymentMethods[0].code === '001') {
    //   return <p>{localizedWords.entries.Lcz_SecureByCard}</p>;
    // }
    if (paymentLength > 1) {
      const filteredMap = app_store.property?.allowed_payment_methods
        .map(apm => {
          if (!apm.is_active) {
            return null;
          }
          // if (apm.code === '000') {
          //   return null;
          // }
          if (apm.is_payment_gateway && this.prepaymentAmount === 0) {
            return null;
          }
          return {
            id: apm.code,
            value: apm.is_payment_gateway
              ? `${localizedWords.entries[`Lcz_Pay_${apm.code}`] ?? localizedWords.entries.Lcz_PayByCard}`
              : apm.code === '001' || apm.code === '004'
                ? localizedWords.entries.Lcz_SecureByCard
                : apm.description,
          };
        })
        .filter(p => p !== null);
      if (filteredMap.length === 0) {
        return <p class="text-center">{localizedWords.entries.Lcz_NoDepositRequired}</p>;
      } else if (filteredMap.length === 1 && ['001', '005'].includes(filteredMap[0].id)) {
        return null;
      }

      return (
        <ir-select
          variant="double-line"
          value={this.selectedPaymentMethod.toString()}
          label={localizedWords.entries.Lcz_SelectYourPaymentMethod}
          data={filteredMap}
          onValueChange={this.handlePaymentSelectionChange.bind(this)}
        ></ir-select>
      );
    }
    const paymentOption = app_store.property.allowed_payment_methods[0];
    if (this.prepaymentAmount === 0 && paymentOption.is_payment_gateway) {
      return <p class="text-center">{localizedWords.entries.Lcz_NoDepositRequired}</p>;
    }
    if (paymentOption.is_payment_gateway) {
      return <p class="text-center">{`${localizedWords.entries[`Lcz_Pay_${paymentOption.code}`] ?? localizedWords.entries.Lcz_PayByCard}`} </p>;
    }
    return null;
  }

  render() {
    console.log(booking_store.bookingAvailabilityParams.agent);
    const hasAgentWithCode001 = booking_store.bookingAvailabilityParams.agent && booking_store.bookingAvailabilityParams.agent.payment_mode.code === '001';
    return (
      <div class="w-full space-y-4 rounded-md border border-solid bg-white  p-4">
        {!hasAgentWithCode001 && this.prepaymentAmount === 0 && this.selectedPaymentMethod === '001' && <p>{localizedWords.entries.Lcz_PaymentSecurity}</p>}
        {!hasAgentWithCode001 && this.renderPaymentOptions()}
        {!hasAgentWithCode001 && this.renderPaymentMethod()}
        {hasAgentWithCode001 && <p class={'text-center'}>{localizedWords.entries.Lcz_OnCredit}</p>}
        {this.cardType !== '' &&
          !app_store.property.allowed_cards.find(c => c.name.toLowerCase().includes(this.cardType === 'AMEX' ? 'american express' : this.cardType?.toLowerCase())) && (
            <p class={'text-red-500'}>
              {localizedWords.entries.Lcz_CardTypeNotSupport}{' '}
              {app_store.property?.allowed_cards?.map((c, i) => `${c.name}${i < app_store.property?.allowed_cards.length - 1 ? ', ' : ''}`)}
            </p>
          )}
      </div>
    );
  }
}
