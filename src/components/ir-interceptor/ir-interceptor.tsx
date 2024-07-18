import { Component, Host, Prop, State, h } from '@stencil/core';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
// import { IToast } from '../ir-toast/toast';
import interceptor_requests from '@/stores/ir-interceptor.store';

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

  @Prop({ reflect: true }) handledEndpoints = ['/ReAllocate_Exposed_Room', '/Do_Payment', '/Get_Exposed_Bookings'];
  alertRef: HTMLIrAlertDialogElement;
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
      this.handleError(response.data.ExceptionMsg);
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
  render() {
    return (
      <Host>
        <ir-alert-dialog ref={el => (this.alertRef = el)}>
          <h1 slot="modal-title" class={'flex items-center'}>
            {' '}
            <ir-icons name="danger"></ir-icons>
            <span>Something went wrong!</span>
          </h1>
          <div slot="modal-body">
            <p>{this.errorMessage}</p>
            <button>Cancel</button>
            <button>Ok</button>
          </div>
        </ir-alert-dialog>
      </Host>
    );
  }
}
