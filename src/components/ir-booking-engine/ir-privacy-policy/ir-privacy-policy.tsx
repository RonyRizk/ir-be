import app_store from '@/stores/app.store';
import localizedWords from '@/stores/localization.store';
import { Component, Host, Method, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-privacy-policy',
  styleUrl: 'ir-privacy-policy.css',
  shadow: true,
})
export class IrPrivacyPolicy {
  @Prop() label = 'privacy policy';
  @Prop() hideTrigger = false;
  @Prop() policyTriggerStyle: Partial<CSSStyleDeclaration>;
  dialogRef: HTMLIrDialogElement;

  replaceStringByObjectValue(input: string, replacements: { [key: string]: string }): string {
    if (!input) {
      return '';
    }
    for (const [key, value] of Object.entries(replacements)) {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      input = input.replace(new RegExp(escapedKey, 'g'), value);
    }
    return input;
  }
  @Method()
  async openModal() {
    this.dialogRef.openModal();
  }
  @Method()
  async closeModal() {
    this.dialogRef.closeModal();
  }

  render() {
    return (
      <Host>
        {!this.hideTrigger && (
          <ir-button
            label={this.label}
            buttonStyles={{ padding: '0', background: 'transparent', ...this.policyTriggerStyle }}
            variants="link"
            onButtonClick={() => this.dialogRef.openModal()}
          ></ir-button>
        )}
        <ir-dialog ref={el => (this.dialogRef = el)}>
          <div class="max-h-[83vh] overflow-y-auto p-4  text-[var(--gray-600,#475467)] md:p-6" slot="modal-title">
            <h1 class="mb-4 text-xl font-semibold capitalize text-[var(--gray-700,#344054)]">{localizedWords.entries.Lcz_PrivacyPolicy}</h1>
            <div class="text-sm">
              <p
                innerHTML={this.replaceStringByObjectValue(app_store.property?.privacy_policy, {
                  '[AC_NAME]': app_store.property?.name,
                  '[URL]': app_store.property?.space_theme.website,
                  '[ADDRESS]': app_store.property?.address,
                  '[AREA]': app_store.property?.area,
                  '[LEVEL2]': app_store.property?.city.name,
                  '[COUNTRY]': app_store.property?.country.name,
                })}
              ></p>
            </div>
          </div>
        </ir-dialog>
      </Host>
    );
  }
}
