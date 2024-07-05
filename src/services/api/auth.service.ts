import { MissingTokenError, Token } from '@/models/Token';
import app_store from '@/stores/app.store';
import { TSignInValidator, TSignUpValidator } from '@/validators/auth.validator';
import axios from 'axios';
import { PropertyService } from './property.service';
import { manageAnchorSession } from '@/utils/utils';
import { checkout_store } from '@/stores/checkout.store';
import { CommonService } from './common.service';
interface BaseLoginParams {
  option: 'google' | 'direct';
}

interface GoogleLoginParams extends BaseLoginParams {
  option: 'google';
  token: string;
}

interface DirectLoginParams extends BaseLoginParams {
  option: 'direct';
  params: TSignInValidator;
}

type LoginParams = GoogleLoginParams | DirectLoginParams;
interface LoginSuccessPayload {
  state: 'success';
  token: string;
  payload: {
    method: 'google' | 'direct';
    token?: string;
    params?: TSignInValidator;
  };
}

interface LoginFailurePayload {
  state: 'failed';
  error: string;
}

type LoginEventPayload = LoginSuccessPayload | LoginFailurePayload;

export class AuthService extends Token {
  private subscribers: ((result: LoginEventPayload) => void)[] = [];

  // public onLoginCompleted(listener: (result: LoginEventPayload) => void) {
  //   this.loginResylt.emit('loginCompleted', listener);
  // }
  public subscribe(callback: (result: LoginEventPayload) => void) {
    this.subscribers.push(callback);
  }

  public unsubscribe(callback: (result: LoginEventPayload) => void) {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  private notifySubscribers(payload: LoginEventPayload) {
    this.subscribers.forEach(callback => callback(payload));
  }
  public async signOut() {
    app_store.is_signed_in = false;
    checkout_store.userFormData = {
      firstName: null,
      lastName: null,
      email: null,
      mobile_number: null,
      country_phone_prefix: null,
    };
    manageAnchorSession({ login: null }, 'remove');
    if (!['booking', 'checkout'].includes(app_store.currentPage)) {
      app_store.currentPage = 'booking';
    }
    const token = await new CommonService().getBEToken();
    app_store.app_data = { ...app_store.app_data, token };
  }
  public async login(params: LoginParams, signIn: boolean = true) {
    const token = this.getToken();
    const { option, ...rest } = params;
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Exposed_Guest_SignIn?Ticket=${token}`, option === 'direct' ? (rest as DirectLoginParams).params : { ...rest });
    if (data['ExceptionMsg'] !== '') {
      this.notifySubscribers({
        state: 'failed',
        error: data['ExceptionMsg'],
      });
      throw new Error(data['ExceptionMsg']);
    }
    const loginToken = data['My_Result'];
    if (signIn) {
      localStorage.setItem('ir-token', loginToken);
      app_store.app_data.token = loginToken;
      app_store.is_signed_in = true;
      manageAnchorSession({ login: { method: option, ...rest, isLoggedIn: true, token: loginToken } });
    }
    const propertyService = new PropertyService();
    propertyService.setToken(loginToken);
    propertyService.getExposedGuest();
    this.notifySubscribers({
      state: 'success',
      token: loginToken,
      payload: {
        method: option,
        ...rest,
      },
    });
    return data['My_Result'];
  }

  public async signUp(params: TSignUpValidator) {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Exposed_Guest_SignUp?Ticket=${token}`, params);
    if (data['ExceptionMsg'] !== '') {
      throw new Error(data['ExceptionMsg']);
    }
    localStorage.setItem('ir-token', data['My_Result']);
    app_store.app_data.token = data['My_Result'];
  }

  public initializeFacebookSignIn() {
    window.fbAsyncInit = () => {
      FB.init({
        appId: '1630011277802654',
        cookie: true,
        xfbml: true,
        version: 'v19.0',
      });

      FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }

  private async handleCredentialResponse(response) {
    try {
      const token = await this.login({ option: 'google', token: response.credential });
      return { state: 'success', token };
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
      return { state: 'failed', token: '' };
    }
  }
  public async loginWithFacebook() {
    FB.login(function (response) {
      if (response.authResponse) {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', { fields: 'name, email, id' }, function (response) {
          console.log(response);
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    });
    FB.getLoginStatus(response => {
      console.log('login status', response);
    });
  }

  createFakeGoogleWrapper() {
    const googleLoginWrapper = document.createElement('div');
    googleLoginWrapper.style.display = 'none';
    googleLoginWrapper.classList.add('custom-google-button');
    document.body.appendChild(googleLoginWrapper);
    window.google.accounts.id.renderButton(googleLoginWrapper, {
      type: 'icon',
      width: '200',
    });
    const googleLoginWrapperButton = googleLoginWrapper.querySelector('div[role=button]');
    return {
      click: () => {
        (googleLoginWrapperButton as any).click();
      },
    };
  }
  loadGoogleSignInScript(element: any) {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.initializeGoogleSignIn(element);
    document.head.appendChild(script);
  }
  initializeGoogleSignIn(element: any) {
    window.google.accounts.id.initialize({
      client_id: '1035240403483-60urt17notg4vmvjbq739p0soqup0o87.apps.googleusercontent.com',
      callback: async response => {
        this.handleCredentialResponse(response);
      },
      auto_select: true,
      ux_mode: 'popup',
    });

    element = this.createFakeGoogleWrapper();
    (window as any).handleGoogleLogin = () => {
      element.click();
    };
  }
}
