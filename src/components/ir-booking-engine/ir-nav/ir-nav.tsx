import { Component, Event, EventEmitter, Fragment, h, Listen, Prop, State } from '@stencil/core';
import { TTabsState } from './nav-types';
import { ICurrency, IExposedLanguages, pages } from '@/models/common';
import app_store from '@/stores/app.store';
import { cn } from '@/utils/utils';
import localizedWords from '@/stores/localization.store';
import { AuthService } from '@/services/api/auth.service';
import { checkout_store } from '@/stores/checkout.store';

@Component({
  tag: 'ir-nav',
  styleUrl: 'ir-nav.css',
  scoped: true,
})
export class IrNav {
  @Prop() currencies: ICurrency[];
  @Prop() languages: IExposedLanguages[];
  @Prop() logo: string;
  @Prop() website: string;
  @Prop() isBookingListing = false;
  @Prop() showBookingCode: boolean = true;
  @Prop() showCurrency: boolean = true;

  @Event() routing: EventEmitter<pages>;
  @State() currentPage: TTabsState = null;

  private dialogRef: HTMLIrDialogElement;
  private sheetRef: HTMLIrSheetElement;
  modalRef: HTMLIrModalElement;

  handleButtonClick(e: CustomEvent = undefined, page: TTabsState) {
    if (e) {
      e.stopImmediatePropagation();
      e.stopPropagation();
    }
    this.currentPage = page;
    setTimeout(() => {
      this.dialogRef.openModal();
    }, 50);
  }
  @Listen('closeDialog')
  handleCloseDialog(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.dialogRef.closeModal();
  }
  renderDialogBody() {
    switch (this.currentPage) {
      case 'language':
        return <ir-language-picker slot="modal-body" currencies={this.currencies} languages={this.languages}></ir-language-picker>;
      case 'booking_code':
        return <ir-booking-code slot="modal-body"></ir-booking-code>;
      case 'map':
        return <ir-google-maps slot="modal-body"></ir-google-maps>;
      case 'profile':
        return (
          <ir-user-profile
            user_data={{
              email: checkout_store.userFormData.email,
              first_name: checkout_store.userFormData.firstName,
              last_name: checkout_store.userFormData.lastName,
              country_id: checkout_store.userFormData.country_id,
              mobile: checkout_store.userFormData.mobile_number,
            }}
            slot="modal-body"
          ></ir-user-profile>
        );
      default:
        return null;
    }
  }
  renderLocationField(field: string | null, withComma: boolean = true) {
    if (!field) {
      return '';
    }
    return withComma ? `, ${field}` : field;
  }
  renderLocation() {
    const affiliate = app_store.app_data.affiliate;
    if (affiliate) {
      return [app_store.property?.city.name ?? null, app_store.property?.country.name ?? null].filter(f => f !== null).join(', ');
    }
    return [app_store.property?.area ?? null, app_store.property?.city.name ?? null, app_store.property?.country.name ?? null].filter(f => f !== null).join(', ');
  }
  renderLanguageTrigger() {
    if (this.isBookingListing) {
      return;
    }
    const currency = app_store.currencies.find(currency => currency.code.toString().toLowerCase() === app_store.userPreferences.currency_id.toLowerCase());
    const country = app_store.languages.find(l => l.code.toLowerCase() === app_store.userPreferences.language_id.toLowerCase());
    if (!currency || !country) {
      return null;
    }
    return (
      <div class="flex">
        <button type="button" class="ir-language-trigger" onClick={() => this.handleButtonClick(undefined, 'language')}>
          <p>{(0).toLocaleString('en-US', { style: 'currency', currency: currency.code, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\d/g, '').trim()}</p>
        </button>
        <button type="button" class="ir-language-trigger" onClick={() => this.handleButtonClick(undefined, 'language')}>
          {/* <ir-icons name="globe"></ir-icons> */}
          <p>{country?.description}</p>
        </button>
      </div>
    );
  }
  handleItemSelect(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const id = e.detail;
    console.log('id', id);
    switch (id) {
      case 1:
        return this.routing.emit('booking-listing');
      case 2:
        return new AuthService().signOut();
      case 3: {
        this.currentPage = 'profile';
        this.dialogRef.openModal();
      }
      default:
        return null;
    }
  }

  render() {
    const currentPage = app_store.currentPage;
    const isInjected = app_store.app_data.injected && currentPage === 'booking';
    return (
      <Fragment>
        <nav class="ir-nav">
          <div class="ir-nav-container">
            {!isInjected && (
              <div class="ir-nav-left">
                <a aria-label="home" href={`${this.website?.replace('www.', 'https://')}`}>
                  <img
                    src={app_store.app_data?.affiliate ? app_store.app_data?.affiliate.sites[0]?.logo : this.logo}
                    alt={`${app_store.property?.name}, ${app_store.property?.country.name}`}
                    class="ir-nav-logo"
                  ></img>
                </a>
                <div class="ir-nav-property-details">
                  <h3 class="ir-property-name">{app_store.property?.name}</h3>
                  <button onClick={() => this.handleButtonClick(undefined, 'map')} class="ir-property-location">
                    {/* {this.renderLocationField(app_store.property?.area, false)}
                    {this.renderLocationField(app_store.property?.city.name)} */}
                    {/* {this.renderLocationField(app_store.property?.postal)} */}
                    {/* {this.renderLocationField(app_store.property?.country.name)} */}
                    {this.renderLocation()}
                    <span class={'mx-1'}></span>
                    {/* <ir-icons name="location_dot" slot="btn-icon"></ir-icons> */}
                    <svg slot="btn-icon" xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 384 512">
                      <path
                        fill="currentColor"
                        d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"
                      />
                      <title>Location</title>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div class={`ir-burger-menu ${isInjected ? 'ir-nav-injected' : ''}`}>
              {!app_store.is_signed_in ? (
                <ir-button
                  class="ir-sheet-button"
                  variants="ghost"
                  label="Sign in"
                  name="auth"
                  onButtonClick={e => {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    this.currentPage = 'auth';
                    this.modalRef.openModal();
                  }}
                ></ir-button>
              ) : (
                <ir-menu
                  data={[
                    { id: 1, item: 'My bookings' },
                    { id: 3, item: 'Personal profile' },
                    { id: 2, item: 'Sign out' },
                  ]}
                  onMenuItemClick={this.handleItemSelect.bind(this)}
                >
                  <ir-user-avatar slot="menu-trigger"></ir-user-avatar>
                </ir-menu>
              )}
              {this.showBookingCode && this.showCurrency && (
                <ir-button variants="icon" iconName="burger_menu" onClick={() => this.sheetRef.openSheet()}>
                  {/* <p slot="btn-icon" class="sr-only">
                  burger menu
                </p>
                <ir-icons slot="btn-icon" ></ir-icons> */}
                </ir-button>
              )}
            </div>

            <ul class={cn('ir-nav-links', { 'ir-nav-links-injected': isInjected })}>
              {!isInjected && currentPage !== 'checkout' && (
                <li>
                  <ir-button variants="ghost" haveLeftIcon title="home">
                    <p slot="left-icon" class="sr-only">
                      home
                    </p>
                    <ir-icons slot="left-icon" name="home" svgClassName="ir-icon-size"></ir-icons>
                  </ir-button>
                </li>
              )}
              {currentPage === 'booking' && this.showBookingCode && (
                <li>
                  <ir-button
                    variants="ghost"
                    label={localizedWords.entries.Lcz_BookingCode}
                    name="booking_code"
                    onButtonClick={e => this.handleButtonClick(e, 'booking_code')}
                  ></ir-button>
                </li>
              )}
              {this.showCurrency && <li>{this.renderLanguageTrigger()}</li>}
              {!app_store.is_signed_in ? (
                <li>
                  <ir-button
                    variants="ghost"
                    label={localizedWords.entries.Lcz_SignIn}
                    name="auth"
                    onButtonClick={e => {
                      e.stopImmediatePropagation();
                      e.stopPropagation();
                      this.currentPage = 'auth';
                      this.modalRef.openModal();
                    }}
                  ></ir-button>
                </li>
              ) : (
                <li>
                  <ir-menu
                    data={[
                      { id: 1, item: 'My bookings' },
                      { id: 3, item: 'Personal profile' },
                      { id: 2, item: 'Sign out' },
                    ]}
                    onMenuItemClick={this.handleItemSelect.bind(this)}
                  >
                    <ir-user-avatar slot="menu-trigger"></ir-user-avatar>
                  </ir-menu>
                </li>
              )}
            </ul>
          </div>
        </nav>

        <ir-sheet ref={el => (this.sheetRef = el)}>
          <ul slot="sheet-content" class="ir-sheet-content">
            <li>{this.renderLanguageTrigger()}</li>
            {!isInjected && (
              <li>
                <ir-button class="ir-sheet-button" buttonClassName="justify-start" variants="ghost" label="Home" name="home"></ir-button>
              </li>
            )}
            <li>
              <ir-button
                class="ir-sheet-button"
                buttonClassName="justify-start"
                variants="ghost"
                label="Booking code"
                name="booking_code"
                onButtonClick={e => this.handleButtonClick(e, 'booking_code')}
              ></ir-button>
            </li>
          </ul>
        </ir-sheet>
        {!app_store.is_signed_in && <ir-modal ref={el => (this.modalRef = el)} style={{ '--ir-modal-max-width': '32rem' }}></ir-modal>}
        <ir-dialog ref={el => (this.dialogRef = el)} style={{ '--ir-dialog-max-width': this.currentPage === 'map' ? '80%' : '32rem' }}>
          {this.renderDialogBody()}
        </ir-dialog>
      </Fragment>
    );
  }
}
