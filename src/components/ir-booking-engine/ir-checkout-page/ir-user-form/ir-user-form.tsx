import { IrUserFormData } from '@/models/user_form';
import { PropertyService } from '@/services/api/property.service';
import app_store from '@/stores/app.store';
import { checkout_store, updateUserFormData } from '@/stores/checkout.store';
import localizedWords from '@/stores/localization.store';
import { Component, Event, EventEmitter, Fragment, h, Prop } from '@stencil/core';
import { ZodIssue } from 'zod';

@Component({
  tag: 'ir-user-form',
  styleUrl: 'ir-user-form.css',
  shadow: true,
})
export class IrUserForm {
  @Prop() errors: Record<string, ZodIssue>;

  @Event() changePageLoading: EventEmitter<'remove' | 'add'>;

  private propertyService = new PropertyService();

  async componentWillLoad() {
    this.propertyService.setToken(app_store.app_data.token);
    await this.propertyService.fetchSetupEntries();
  }
  render() {
    if (!app_store.setup_entries) {
      return (
        <div class={'flex h-72 flex-col'}>
          <ir-checkout-skeleton></ir-checkout-skeleton>
        </div>
      );
    }
    return (
      <Fragment>
        <section class="user-form-section">
          <div class="user-form-content">
            <div class="user-form-row">
              <ir-input
                placeholder=""
                value={checkout_store.userFormData?.firstName}
                data-state={this.errors?.firstName ? 'error' : ''}
                label={localizedWords.entries.Lcz_FirstName}
                onTextChanged={e => updateUserFormData('firstName', e.detail)}
                class="user-form-input"
                onInputBlur={e => {
                  const firstNameSchema = IrUserFormData.pick({ firstName: true });
                  const firstNameValidation = firstNameSchema.safeParse({ firstName: checkout_store.userFormData?.firstName });
                  const target: HTMLIrInputElement = e.target;
                  if (!firstNameValidation.success) {
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
              />
              <ir-input
                placeholder=""
                value={checkout_store.userFormData?.lastName}
                label={localizedWords.entries.Lcz_LastName}
                onTextChanged={e => updateUserFormData('lastName', e.detail)}
                class="user-form-input"
                data-state={this.errors?.lastName ? 'error' : ''}
                onInputBlur={e => {
                  const lastNameSchema = IrUserFormData.pick({ lastName: true });
                  const lastNameValidation = lastNameSchema.safeParse({ lastName: checkout_store.userFormData?.lastName });
                  if (!lastNameValidation.success) {
                    const target: HTMLIrInputElement = e.target;
                    target.setAttribute('data-state', 'error');
                  }
                }}
                onInputFocus={e => {
                  const target: HTMLIrInputElement = e.target;
                  if (target.hasAttribute('data-state')) target.removeAttribute('data-state');
                }}
              />
            </div>
            <div class="user-form-row">
              <ir-input
                placeholder=""
                value={checkout_store.userFormData?.email}
                label={localizedWords.entries.Lcz_EmailAddress}
                onTextChanged={e => updateUserFormData('email', e.detail)}
                data-state={this.errors?.email ? 'error' : ''}
                class="user-form-input"
                onInputBlur={e => {
                  const schema = IrUserFormData.pick({ email: true });
                  const schemaValidation = schema.safeParse({ email: checkout_store.userFormData?.email });
                  const target: HTMLIrInputElement = e.target;
                  if (!schemaValidation.success) {
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
              />
              {/* <ir-input onTextChanged={e => updateUserFormData('mobile_number', e.detail)} class="w-full" /> */}
              <ir-phone-input
                mobile_number={(checkout_store.userFormData?.mobile_number || '').toString()}
                data-state={this.errors?.mobile_number ? 'error' : ''}
                class="user-form-input"
                onTextChange={e => {
                  updateUserFormData('mobile_number', e.detail.mobile);
                  updateUserFormData('country_phone_prefix', e.detail.phone_prefix);
                }}
                country_code={checkout_store.userFormData.country_id || null}
                onPhoneInputBlur={e => {
                  const schema = IrUserFormData.pick({ mobile_number: true });
                  const schemaValidation = schema.safeParse({ mobile_number: checkout_store.userFormData?.mobile_number });
                  const target: HTMLIrPhoneInputElement = e.target;
                  if (!schemaValidation.success) {
                    target.setAttribute('data-state', 'error');
                    target.setAttribute('aria-invalid', 'true');
                  } else {
                    if (target.hasAttribute('aria-invalid')) {
                      target.setAttribute('aria-invalid', 'false');
                    }
                  }
                }}
                onPhoneInputFocus={e => {
                  const target: HTMLIrPhoneInputElement = e.target;
                  if (target.hasAttribute('data-state')) target.removeAttribute('data-state');
                }}
              ></ir-phone-input>
            </div>
            <div class="user-form-row">
              <ir-select
                label={localizedWords.entries.Lcz_YourArrivalTime.replace('%1', app_store.property?.time_constraints.check_in_from)}
                variant="double-line"
                value={checkout_store.userFormData?.arrival_time}
                onValueChange={e => updateUserFormData('arrival_time', e.detail)}
                data={app_store.setup_entries.arrivalTime.map(entry => ({
                  id: entry.CODE_NAME,
                  value: entry[`CODE_VALUE_${app_store.userPreferences.language_id.toUpperCase()}`],
                }))}
                class="user-form-input"
              ></ir-select>
              {/* <ir-input label="Your arrival time(check-in from 14:00)" onTextChanged={e => updateUserFormData('arrival_time', e.detail)} class="w-full" /> */}
            </div>
            <ir-textarea
              value={checkout_store.userFormData?.message}
              placeholder=""
              label={localizedWords.entries.Lcz_AnyMessageForUs}
              maxlength={555}
              onTextChanged={e => updateUserFormData('message', e.detail)}
              class="w-full"
            />
          </div>
          <ir-checkbox
            checked={checkout_store.userFormData?.bookingForSomeoneElse}
            label={localizedWords.entries.Lcz_IAmBooklingForSomeoneElse}
            class="user-form-checkbox"
            onCheckChange={e => updateUserFormData('bookingForSomeoneElse', e.detail)}
          />
        </section>
      </Fragment>
    );
  }
}
