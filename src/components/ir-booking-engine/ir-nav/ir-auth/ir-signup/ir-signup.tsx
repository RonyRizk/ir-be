import { Component, Host, h, Event, EventEmitter, State } from '@stencil/core';
import { SignUpValidtor, TSignUpAuthTrigger, TSignUpValidator } from '@/validators/auth.validator';
import { ZodError } from 'zod';
import IntegrationIcons from '@/assets/integration_icons';
import { TAuthNavigation } from '../auth.types';
import localizedWords from '@/stores/localization.store';

@Component({
  tag: 'ir-signup',
  styleUrl: 'ir-signup.css',
  shadow: true,
})
export class IrSignup {
  @State() signUpParams: TSignUpValidator = {};
  @State() formState: {
    status: 'empty' | 'valid' | 'invalid';
    errors: Record<keyof TSignUpValidator, ZodError> | null;
  } = { errors: null, status: 'empty' };

  @Event() navigate: EventEmitter<TAuthNavigation>;
  @Event() signUp: EventEmitter<TSignUpAuthTrigger>;

  modifySignUpParams(params: Partial<TSignUpValidator>) {
    if (!this.signUpParams) {
      this.signUpParams = {};
    }
    this.signUpParams = { ...this.signUpParams, ...params };
  }
  handleSignUp(e: Event) {
    e.preventDefault();
    try {
      this.formState.errors = null;
      const params = SignUpValidtor.parse(this.signUpParams);
      this.signUp.emit({ trigger: 'be', params });
    } catch (error) {
      if (error instanceof ZodError) {
        let newErrors: Record<keyof TSignUpValidator, ZodError> = {
          email: undefined,
          password: undefined,
          first_name: undefined,
          last_name: undefined,
        };
        error.issues.map(e => {
          newErrors[e.path[0]] = e.message;
        });
        this.formState = {
          status: 'invalid',
          errors: { ...newErrors },
        };
      }
    }
  }
  render() {
    return (
      <Host>
        <h1 class="title mb-6">Create an account</h1>
        <form onSubmit={this.handleSignUp.bind(this)} class="mb-6 space-y-3">
          <fieldset>
            <ir-input error={!!this.formState?.errors?.first_name} inputId="first_name" label={localizedWords.entries.Lcz_EnterYourFirstName}></ir-input>
          </fieldset>
          <fieldset>
            <ir-input error={!!this.formState?.errors?.last_name} inputId="last_name" label={localizedWords.entries.Lcz_EnterYourLastName}></ir-input>
          </fieldset>
          <fieldset>
            <ir-input error={!!this.formState?.errors?.email} inputId="email" label="Enter your email"></ir-input>
          </fieldset>
          <fieldset>
            <ir-input error={!!this.formState?.errors?.password} inputId="password" type="password" label={localizedWords.entries.Lcz_EnterYourPassword}></ir-input>
          </fieldset>
          <ir-button type="submit" class="mt-4 w-full" label="Sign up" size="md"></ir-button>
        </form>
        <div class="mb-4 flex items-center justify-center gap-4">
          <div class="h-[1px] w-[45%] bg-[var(--gray-200)]"></div>
          <span class="text-[var(--gray-500)]">OR</span>
          <div class="h-[1px] w-[45%] bg-[var(--gray-200)]"></div>
        </div>
        <ir-button class="mb-2.5 w-full" onButtonClick={() => this.signUp.emit({ trigger: 'google' })} variants="outline" label="Continue with Google" haveLeftIcon>
          <span slot="left-icon">{IntegrationIcons.google}</span>
        </ir-button>
        <ir-button class="w-full" variants="outline" onButtonClick={() => this.signUp.emit({ trigger: 'fb' })} label="Continue with Facebook" haveLeftIcon>
          <svg slot="left-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1256_132001)">
              <path
                d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
                fill="#1877F2"
              />
              <path
                d="M16.6711 15.4688L17.2031 12H13.875V9.75C13.875 8.80102 14.34 7.875 15.8306 7.875H17.3438V4.92188C17.3438 4.92188 15.9705 4.6875 14.6576 4.6875C11.9166 4.6875 10.125 6.34875 10.125 9.35625V12H7.07812V15.4688H10.125V23.8542C11.3674 24.0486 12.6326 24.0486 13.875 23.8542V15.4688H16.6711Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0_1256_132001">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </ir-button>
        <div class="mt-4 flex items-center justify-center">
          <p class="dont-have-an-account">Already have an account?</p>
          <ir-button label="Sign in" variants="ghost-primary" onButtonClick={() => this.navigate.emit('login')}></ir-button>
        </div>
      </Host>
    );
  }
}
