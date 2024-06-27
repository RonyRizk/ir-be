import { IrGuest, TGuest } from '@/models/user_form';
import { Component, h, Prop, State } from '@stencil/core';
import phone_input_store from '../ui/ir-phone-input/phone.store';
import { checkout_store } from '@/stores/checkout.store';
import { ZodError } from 'zod';

@Component({
  tag: 'ir-user-profile',
  styleUrl: 'ir-user-profile.css',
  shadow: true,
})
export class IrUserProfile {
  @Prop() user_data: TGuest = {};

  @State() user: TGuest = {};

  componentWillLoad() {
    this.user = { ...this.user_data };
  }

  updateUserData(key: keyof TGuest, value: unknown) {
    this.user = {
      ...this.user,
      [key]: value,
    };
  }

  handleSubmit(e: Event) {
    e.preventDefault();
    try {
      IrGuest.parse(this.user);
      const { email, country_id, first_name, last_name, mobile } = this.user;
      checkout_store.userFormData = {
        ...checkout_store.userFormData,
        country_code: country_id,
        email,
        firstName: first_name,
        lastName: last_name,
        mobile_number: mobile,
        country_id,
      };
    } catch (error) {
      if (error instanceof ZodError) {
      }
    }
  }

  render() {
    return (
      <section class="p-4">
        <h1 class="mb-6 text-lg font-medium">Personal profile</h1>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <div class="grid gap-4 md:grid-cols-2">
            <ir-input
              label="Email"
              placeholder=""
              value={this.user.email}
              onInputBlur={e => {
                const emailSchema = IrGuest.pick({ email: true });
                const schemaValidation = emailSchema.safeParse({ email: this.user?.email });
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
              onTextChanged={e => this.updateUserData('email', e.detail)}
            ></ir-input>
            <ir-input
              label="Password"
              type="password"
              value={this.user.password}
              placeholder=""
              onInputBlur={e => {
                const emailSchema = IrGuest.pick({ password: true });
                const schemaValidation = emailSchema.safeParse({ password: this.user?.password });
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
              onTextChanged={e => this.updateUserData('password', e.detail)}
            ></ir-input>
            <ir-input
              label="First name"
              onTextChanged={e => this.updateUserData('first_name', e.detail)}
              value={this.user.first_name}
              placeholder=""
              onInputBlur={e => {
                const emailSchema = IrGuest.pick({ first_name: true });
                const schemaValidation = emailSchema.safeParse({ first_name: this.user?.first_name });
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
            ></ir-input>
            <ir-input
              value={this.user.last_name}
              label="Last name"
              placeholder=""
              onTextChanged={e => this.updateUserData('last_name', e.detail)}
              onInputBlur={e => {
                const emailSchema = IrGuest.pick({ last_name: true });
                const schemaValidation = emailSchema.safeParse({ last_name: this.user?.last_name });
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
            ></ir-input>
            <ir-select
              value={2}
              label="Country"
              variant="double-line"
              data={phone_input_store.countries?.map(country => ({
                id: country.id,
                value: country.name,
              }))}
              onValueChange={e => this.updateUserData('country_id', e.detail)}
            ></ir-select>
            <ir-input label="City" placeholder="" value={this.user.city} onTextChanged={e => this.updateUserData('city', e.detail)}></ir-input>
            <ir-input label="Address" placeholder="" value={this.user.address} onTextChanged={e => this.updateUserData('address', e.detail)}></ir-input>
            <ir-phone-input
              country_code={this.user.country_id || null}
              onTextChange={e => {
                this.updateUserData('mobile', e.detail.mobile);
                this.updateUserData('country_id', e.detail.phone_prefix);
              }}
              mobile_number={(this.user.mobile || '').toString()}
              onPhoneInputBlur={e => {
                const schema = IrGuest.pick({ mobile: true });
                const schemaValidation = schema.safeParse({ mobile: this.user.mobile });
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
            <ir-checkbox onCheckChange={e => this.updateUserData('subscribe_to_news_letter', e.detail)} label="Register for exclusive deals"></ir-checkbox>
          </div>
          <div class="flex items-center justify-end">
            <ir-button type="submit" label="Save" class="mt-6 w-full md:w-fit"></ir-button>
          </div>
        </form>
      </section>
    );
  }
}
