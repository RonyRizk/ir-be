import { Component, Host, Listen, State, h, Element, Event, EventEmitter, Prop } from '@stencil/core';
import { TAuthNavigation } from './auth.types';
import { AuthService } from '@/services/api/auth.service';
import app_store from '@/stores/app.store';

@Component({
  tag: 'ir-auth',
  styleUrl: 'ir-auth.css',
  scoped: true,
})
export class IrAuth {
  @Element() el: HTMLElement;
  @Prop() enableSignUp: boolean = true;
  @State() authState: TAuthNavigation = 'login';
  @State() animationDirection: string = '';
  @State() signedIn: boolean = false;

  @Event() closeDialog: EventEmitter<null>;

  private authService = new AuthService();
  private googleButtonWrapper: any;

  componentWillLoad() {
    // this.authService.initializeFacebookSignIn();
    if (!document.querySelector('.custom-google-button') && !app_store.app_data.hideGoogleSignIn) {
      this.authService.loadGoogleSignInScript(this.googleButtonWrapper);
    }
    this.authService.subscribe(this.handleAuthStateChange.bind(this));
  }

  @Listen('navigate')
  handleNavigation(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();

    if (this.authState === 'login' && e.detail !== 'login') {
      this.animationDirection = 'slide-right';
    } else if (this.authState !== 'login' && e.detail === 'login') {
      this.animationDirection = 'slide-left';
    }

    this.authState = e.detail;
  }
  @Listen('authFinish')
  handleAuthFinished(e: CustomEvent) {
    const { state } = e.detail;
    if (state === 'success') {
      this.closeDialog.emit(null);
    }
  }
  signUp(params: { email?: string; password?: string; first_name?: string; last_name?: string }) {
    try {
      this.authService.signUp(params);
    } catch (error) {
      console.error('Error during sign-up:', error);
    }
  }
  private handleAuthStateChange(result) {
    if (result.state === 'success' && result.payload.method === 'google') {
      this.closeDialog.emit(null);
    }
  }
  disconnectedCallback() {
    this.authService.unsubscribe(this.handleAuthStateChange.bind(this));
  }
  render() {
    return (
      <Host>
        <div class={`auth-container  ${this.animationDirection}`}>
          {this.authState === 'login' ? (
            <ir-signin
              enableSignUp={this.enableSignUp}
              onSignIn={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                if (e.detail.trigger === 'fb') {
                  this.authService.loginWithFacebook();
                }
              }}
            ></ir-signin>
          ) : (
            <ir-signup
              onSignUp={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                if (e.detail.trigger === 'be') {
                  this.signUp(e.detail.params);
                } else if (e.detail.trigger === 'fb') {
                  this.authService.loginWithFacebook();
                }
              }}
            ></ir-signup>
          )}
          {!app_store.app_data.hideGoogleSignIn && (
            <div class="flex-container">
              <div class="flex-center">
                <div id="googleSignInButton"></div>
              </div>
              <div class="social-container">
                <ir-button
                  ref={el => (this.googleButtonWrapper = el)}
                  class="full-width"
                  onButtonClick={() => (window as any).handleGoogleLogin()}
                  label="Continue with Google"
                  variants="outline"
                  haveLeftIcon
                >
                  <span slot="left-icon">
                    <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_6707_5591)">
                        <path
                          d="M24.266 12.2765C24.266 11.4608 24.1999 10.6406 24.0588 9.83813H12.74V14.4591H19.2217C18.9528 15.9495 18.0885 17.2679 16.823 18.1056V21.104H20.69C22.9608 19.014 24.266 15.9274 24.266 12.2765Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12.74 24.0008C15.9764 24.0008 18.7058 22.9382 20.6944 21.1039L16.8274 18.1055C15.7516 18.8375 14.3626 19.252 12.7444 19.252C9.61376 19.252 6.95934 17.1399 6.00693 14.3003H2.01648V17.3912C4.05359 21.4434 8.20278 24.0008 12.74 24.0008Z"
                          fill="#34A853"
                        />
                        <path
                          d="M6.00253 14.3002C5.49987 12.8099 5.49987 11.196 6.00253 9.70569V6.61475H2.01649C0.31449 10.0055 0.31449 14.0004 2.01649 17.3912L6.00253 14.3002Z"
                          fill="#FBBC04"
                        />
                        <path
                          d="M12.74 4.74966C14.4508 4.7232 16.1043 5.36697 17.3433 6.54867L20.7694 3.12262C18.6 1.0855 15.7207 -0.034466 12.74 0.000808666C8.20277 0.000808666 4.05359 2.55822 2.01648 6.61481L6.00252 9.70575C6.95052 6.86173 9.60935 4.74966 12.74 4.74966Z"
                          fill="#EA4335"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_6707_5591">
                          <rect width="24" height="24" fill="white" transform="translate(0.5)" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                </ir-button>
                {/* <ir-social-button class="full-width" label="Continue with Facebook" onSocialButtonClick={() => this.authService.loginWithFacebook()}>
                <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              </ir-social-button> */}
              </div>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
