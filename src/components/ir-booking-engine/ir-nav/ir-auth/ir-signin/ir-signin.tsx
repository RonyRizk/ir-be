import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { SignInValidtor, TSignInAuthTrigger, TSignInValidator } from '@/validators/auth.validator';
import { ZodError } from 'zod';
import { AuthService } from '@/services/api/auth.service';
import app_store, { onAppDataChange } from '@/stores/app.store';
import { TAuthNavigation } from '../auth.types';

@Component({
  tag: 'ir-signin',
  styleUrl: 'ir-signin.css',
  scoped: true,
})
export class IrSignin {
  @Prop() enableSignUp: boolean = false;
  @State() signInParams: TSignInValidator = {};
  @State() formState: {
    cause: 'zod' | 'auth' | null;
    status: 'empty' | 'valid' | 'invalid';
    errors: Record<keyof TSignInValidator, string> | null;
  } = { cause: null, errors: null, status: 'empty' };
  @State() isLoading = false;
  @Event() authFinish: EventEmitter<{
    state: 'success' | 'failed';
    token: string;
    payload: {
      method: 'direct' | 'google';
      email?: string;
      booking_nbr?: string;
    };
  }>;
  @Event() navigate: EventEmitter<TAuthNavigation>;
  @Event({ bubbles: true, composed: true }) signIn: EventEmitter<TSignInAuthTrigger>;

  private authService = new AuthService();

  componentWillLoad() {
    this.authService.setToken(app_store.app_data.token);
    onAppDataChange('app_data', newValue => {
      this.authService.setToken(newValue.token);
    });
  }

  modifySignInParams(params: Partial<TSignInValidator>) {
    if (!this.signInParams) {
      this.signInParams = {};
    }
    this.signInParams = { ...this.signInParams, ...params };
  }

  async login(params: { email?: string; booking_nbr?: string }) {
    try {
      this.isLoading = true;
      const token = await this.authService.login({ option: 'direct', params });
      this.authFinish.emit({
        state: 'success',
        token,
        payload: {
          method: 'direct',
          ...params,
        },
      });
    } catch (error) {
      this.authFinish.emit({
        state: 'failed',
        token: null,
        payload: {
          method: 'direct',
          ...params,
        },
      });
      this.formState = {
        cause: 'auth',
        status: 'invalid',
        errors: { email: error.message, booking_nbr: error.message },
      };
    } finally {
      this.isLoading = false;
    }
  }
  async handleSignIn(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    try {
      this.formState.errors = null;
      const params = SignInValidtor.parse(this.signInParams);
      this.signIn.emit({ trigger: 'be', params });
      await this.login(params);
    } catch (error) {
      let newErrors: Record<keyof TSignInValidator, string> = {
        email: null,
        booking_nbr: null,
      };
      if (error instanceof ZodError) {
        error.issues.map(e => {
          newErrors[e.path[0]] = e.message;
        });
        this.formState = {
          cause: 'zod',
          status: 'invalid',
          errors: { ...newErrors },
        };
      }
    }
  }

  render() {
    return (
      <Host>
        <h1 class="title">Sign in to your booking</h1>
        <form onSubmit={this.handleSignIn.bind(this)}>
          {this.formState?.cause === 'auth' && this.formState?.errors && (
            <div class="error">
              <ir-badge-group variant="error" badge="Error" message={this.formState?.errors?.email ?? ''}></ir-badge-group>
            </div>
          )}
          <fieldset>
            <ir-input
              error={!!this.formState?.errors?.email}
              onTextChanged={e => this.modifySignInParams({ email: e.detail })}
              autofocus
              inputId="email"
              label="Enter your email"
              onInputBlur={e => {
                const firstNameSchema = SignInValidtor.pick({ email: true });
                const firstNameValidation = firstNameSchema.safeParse({ email: this.signInParams.email });
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
            ></ir-input>
          </fieldset>
          <fieldset>
            <ir-input
              error={!!this.formState?.errors?.booking_nbr}
              onTextChanged={e => this.modifySignInParams({ booking_nbr: e.detail })}
              inputId="booking_nbr"
              type="number"
              label="Enter your booking number"
              onInputBlur={e => {
                const firstNameSchema = SignInValidtor.pick({ booking_nbr: true });
                const firstNameValidation = firstNameSchema.safeParse({ booking_nbr: this.signInParams.booking_nbr });
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
            ></ir-input>
          </fieldset>
          {/* <ir-button variants="default" isLoading={this.isLoading} type="submit" class="ir-buttons" label="Sign in" size="md"></ir-button> */}
          <button class="button-default ir-button text-center" data-size={'md'}>
            {this.isLoading && <span class="loader"></span>}
            Sign in
          </button>
          <div class="divider">
            <div class="divider-line"></div>
            <span class="divider-text">OR</span>
            <div class="divider-line"></div>
          </div>
        </form>
        {/* {this.enableSignUp && (
          <div class="flex items-center justify-center">
            <p class="dont-have-an-account">Don't have an account?</p>
            <button class="sign-up-button" onClick={() => this.navigate.emit('register')}>
              Sign up
            </button>
          </div>
        )} */}
      </Host>
    );
  }
}
