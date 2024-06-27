import localizedWords from '@/stores/localization.store';
import { Component, Host, h, Event, EventEmitter, State, Element, Prop } from '@stencil/core';
import IMask from 'imask';

@Component({
  tag: 'ir-credit-card-input',
  styleUrl: 'ir-credit-card-input.css',
  scoped: true,
})
export class IrCreditCardInput {
  @Prop() value: string;

  @State() cardType: '' | 'AMEX' | 'VISA' | 'Mastercard' = '';
  @State() error: boolean = false;

  @Event() creditCardChange: EventEmitter<string>;

  @Element() el: HTMLElement;

  private mask: any;
  private input: HTMLInputElement;

  private detectCardType(value: string) {
    const startsWith = (prefixes: string[]) => prefixes.some(prefix => value.startsWith(prefix));
    if (startsWith(['4'])) {
      return 'VISA';
    } else if (startsWith(['5', '2'])) {
      return 'Mastercard';
    } else if (startsWith(['34', '37'])) {
      return 'AMEX';
    } else {
      return '';
    }
  }

  private applyMask(cardType: string) {
    if (this.mask) {
      this.mask.destroy();
    }

    const masks = {
      VISA: '0000 0000 0000 0000',
      Mastercard: '0000 0000 0000 0000',
      AMEX: '0000 000000 00000',
    };

    this.mask = IMask(this.input, {
      mask: masks[cardType] || masks['VISA'],
    });
  }

  componentDidLoad() {
    this.input = this.el.querySelector('input');
    this.applyMask(this.cardType);
  }

  handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    this.creditCardChange.emit(value);

    if (value === '') {
      this.cardType = '';
      this.error = false;
    } else {
      const detectedCardType = this.detectCardType(value);
      if (this.cardType !== detectedCardType) {
        this.cardType = detectedCardType;
        this.applyMask(this.cardType);
      }

      // if ((value.startsWith('3') && value.length > 2) || (detectedCardType === '' && value.length > 1)) {
      //   this.error = true;
      // } else {
      //   this.error = false;
      // }
    }
  }

  render() {
    return (
      <Host>
        <div class={`card-container ${this.error ? 'error' : ''}`}>
          <label htmlFor="first_input" class="card-number">
            {localizedWords.entries.Lcz_CardNumber}
          </label>
          <div class="input-container">
            <input
              type="text"
              class="w-full"
              onBlur={e => {
                const target = e.target as HTMLInputElement;
                if (target.value.length === 0) {
                  this.error = true;
                  target.setAttribute('aria-invalid', 'true');
                } else {
                  if (target.hasAttribute('aria-invalid')) {
                    target.setAttribute('aria-invalid', 'false');
                  }
                }
              }}
              autocomplete="cc-number"
              inputMode="numeric"
              onInput={this.handleInput.bind(this)}
            />
            <div class="icon-container">{this.renderIcon(this.cardType)}</div>
          </div>
        </div>
      </Host>
    );
  }

  private renderIcon(cardType: string) {
    const icons = {
      VISA: `<svg width="30" height="20" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="white"/>
      <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F2F4F7"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M10.7501 15.8582H8.69031L7.14576 9.79235C7.07245 9.51332 6.91679 9.26664 6.68782 9.15038C6.11639 8.85821 5.48672 8.62568 4.7998 8.50841V8.27487H8.11789C8.57583 8.27487 8.91929 8.62568 8.97653 9.0331L9.77793 13.4086L11.8367 8.27487H13.8392L10.7501 15.8582ZM14.984 15.8582H13.0388L14.6406 8.27487H16.5858L14.984 15.8582ZM19.1025 10.3757C19.1597 9.96725 19.5032 9.73372 19.9039 9.73372C20.5336 9.67508 21.2195 9.79235 21.7919 10.0835L22.1354 8.45079C21.5629 8.21725 20.9333 8.09998 20.3619 8.09998C18.4738 8.09998 17.1 9.15038 17.1 10.6082C17.1 11.7173 18.0731 12.2996 18.7601 12.6504C19.5032 13.0002 19.7894 13.2337 19.7322 13.5835C19.7322 14.1082 19.1597 14.3418 18.5883 14.3418C17.9014 14.3418 17.2145 14.1669 16.5858 13.8747L16.2424 15.5084C16.9293 15.7996 17.6724 15.9169 18.3594 15.9169C20.4763 15.9745 21.7919 14.9251 21.7919 13.35C21.7919 11.3664 19.1025 11.2502 19.1025 10.3757ZM28.5998 15.8582L27.0553 8.27487H25.3962C25.0528 8.27487 24.7093 8.50841 24.5948 8.85821L21.7347 15.8582H23.7372L24.1369 14.7502H26.5973L26.8263 15.8582H28.5998ZM25.6824 10.3171L26.2539 13.1751H24.6521L25.6824 10.3171Z" fill="#172B85"/>
      </svg>
      `,
      AMEX: `<svg width="30" height="20" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="#1F72CD"/>
      <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F2F4F7"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M6.09517 8.5L2.91406 15.7467H6.7223L7.19441 14.5913H8.27355L8.74566 15.7467H12.9375V14.8649L13.311 15.7467H15.4793L15.8528 14.8462V15.7467H24.5706L25.6307 14.6213L26.6232 15.7467L31.1009 15.7561L27.9097 12.1436L31.1009 8.5H26.6927L25.6608 9.60463L24.6995 8.5H15.2156L14.4013 10.3704L13.5678 8.5H9.7675V9.35186L9.34474 8.5H6.09517ZM6.83205 9.52905H8.68836L10.7984 14.4431V9.52905H12.8319L14.4617 13.0524L15.9637 9.52905H17.987V14.7291H16.7559L16.7458 10.6544L14.9509 14.7291H13.8495L12.0446 10.6544V14.7291H9.51179L9.03162 13.5633H6.43745L5.95827 14.728H4.60123L6.83205 9.52905ZM24.1196 9.52905H19.1134V14.726H24.0421L25.6307 13.0036L27.1618 14.726H28.7624L26.436 12.1426L28.7624 9.52905H27.2313L25.6507 11.2316L24.1196 9.52905ZM7.73508 10.4089L6.8804 12.4856H8.58876L7.73508 10.4089ZM20.3497 11.555V10.6057V10.6048H23.4734L24.8364 12.1229L23.413 13.6493H20.3497V12.613H23.0808V11.555H20.3497Z" fill="white"/>
      </svg>`,
      Mastercard: `<svg width="30" height="20" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="white"/>
      <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F2F4F7"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M17.179 16.8294C15.9949 17.8275 14.459 18.43 12.7807 18.43C9.03582 18.43 6 15.4303 6 11.73C6 8.02966 9.03582 5.02997 12.7807 5.02997C14.459 5.02997 15.9949 5.63247 17.179 6.63051C18.363 5.63247 19.8989 5.02997 21.5773 5.02997C25.3221 5.02997 28.358 8.02966 28.358 11.73C28.358 15.4303 25.3221 18.43 21.5773 18.43C19.8989 18.43 18.363 17.8275 17.179 16.8294Z" fill="#ED0006"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1787 16.8294C18.6366 15.6005 19.5611 13.7719 19.5611 11.73C19.5611 9.68801 18.6366 7.85941 17.1787 6.63051C18.3628 5.63247 19.8987 5.02997 21.577 5.02997C25.3219 5.02997 28.3577 8.02966 28.3577 11.73C28.3577 15.4303 25.3219 18.43 21.577 18.43C19.8987 18.43 18.3628 17.8275 17.1787 16.8294Z" fill="#F9A000"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1793 16.8294C18.6372 15.6005 19.5616 13.7719 19.5616 11.73C19.5616 9.68805 18.6372 7.85946 17.1793 6.63055C15.7213 7.85946 14.7969 9.68805 14.7969 11.73C14.7969 13.7719 15.7213 15.6005 17.1793 16.8294Z" fill="#FF5E00"/>
      </svg>
      `,
    };
    return <div innerHTML={icons[cardType]}></div>;
  }
}
