import { Component, Host, Prop, State, h } from '@stencil/core';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
// import { IToast } from '../ir-toast/toast';
import interceptor_requests from '@/stores/ir-interceptor.store';
import localizedWords from '@/stores/localization.store';

@Component({
  tag: 'ir-interceptor',
  styleUrl: 'ir-interceptor.css',
  shadow: true,
})
export class IrInterceptor {
  @State() isShown = false;
  @State() isLoading = false;
  @State() isUnassignedUnit = false;
  @State() errorMessage: string | null = null;
  @State() lastFailedRequest: AxiosRequestConfig | null = null;

  @Prop({ reflect: true }) handledEndpoints = [];
  alertRef: HTMLIrAlertDialogElement;
  private ignoredErrorRoutes = ['/Exposed_Guest_SignIn', '/Exposed_Guest_SignUp'];
  //@Event({ bubbles: true, composed: true }) toast: EventEmitter<IToast>;
  componentWillLoad() {
    this.setupAxiosInterceptors();
  }

  setupAxiosInterceptors() {
    axios.interceptors.request.use(this.handleRequest.bind(this), this.handleError.bind(this));
    axios.interceptors.response.use(this.handleResponse.bind(this), this.handleError.bind(this));
  }

  extractEndpoint(url: string): string {
    return url.split('?')[0];
  }

  isHandledEndpoint(url: string): boolean {
    return this.handledEndpoints.includes(url);
  }

  handleRequest(config: AxiosRequestConfig) {
    const extractedUrl = this.extractEndpoint(config.url);
    interceptor_requests[extractedUrl] = 'pending';
    if (this.isHandledEndpoint(extractedUrl)) {
      this.isLoading = true;
    }
    return config;
  }

  handleResponse(response: AxiosResponse) {
    console.log('handleResponse');
    const extractedUrl = this.extractEndpoint(response.config.url);
    if (this.isHandledEndpoint(extractedUrl)) {
      this.isLoading = false;
    }
    interceptor_requests[extractedUrl] = 'done';
    if (response.data.ExceptionMsg?.trim()) {
      if (!this.ignoredErrorRoutes.includes(extractedUrl)) {
        this.handleError(response.data.ExceptionMsg);
        this.lastFailedRequest = response.config;
      }
      throw new Error(response.data.ExceptionMsg);
    }
    return response;
  }

  handleError(error: string) {
    console.log('error', error);
    this.errorMessage = error;
    this.alertRef.openModal();
    return Promise.reject(error);
  }
  retryLastRequest() {
    this.alertRef.closeModal();
    this.errorMessage = null;
    if (this.lastFailedRequest) {
      return axios(this.lastFailedRequest);
    }
  }
  render() {
    return (
      <Host>
        <ir-alert-dialog ref={el => (this.alertRef = el)}>
          <div slot="modal-title" class={'flex items-center gap-4 pb-2'}>
            <ir-icons name="danger" class={'text-red-500'} svgClassName="size-6"></ir-icons>
            <h1 class={'text-lg font-semibold'}>{localizedWords?.entries?.Lcz_SomethingWentWrong ?? 'Something went wrong'}!</h1>
          </div>
          <p slot="modal-body">{this.errorMessage}</p>
          <div slot="modal-footer">
            <ir-button label="Cancel" variants="outline" onButtonClick={() => this.alertRef.closeModal()}></ir-button>
            <ir-button label="Try again" onButtonClick={() => this.retryLastRequest()}></ir-button>
          </div>
        </ir-alert-dialog>
      </Host>
    );
  }
}
