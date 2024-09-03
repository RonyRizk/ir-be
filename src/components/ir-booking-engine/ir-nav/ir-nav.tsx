import { Component, Event, EventEmitter, Fragment, h, Listen, Prop, State, Watch } from '@stencil/core';
import { TTabsState } from './nav-types';
import { ICurrency, IExposedLanguages, pages } from '@/models/commun';
import app_store from '@/stores/app.store';
import { cn, renderPropertyLocation } from '@/utils/utils';
import localizedWords from '@/stores/localization.store';
import { AuthService } from '@/services/api/auth.service';
import { checkout_store } from '@/stores/checkout.store';
import booking_store from '@/stores/booking';

@Component({
  tag: 'ir-nav',
  styleUrl: 'ir-nav.css',
  shadow: true,
})
export class IrNav {
  @Prop() currencies: ICurrency[];
  @Prop() languages: IExposedLanguages[];
  @Prop() logo: string;
  @Prop({ mutable: true }) website: string;
  @Prop() isBookingListing = false;
  @Prop() showBookingCode: boolean = true;
  @Prop() showCurrency: boolean = true;
  @Prop() menuShown: boolean = true;

  @Event() routing: EventEmitter<pages>;
  @Event({ bubbles: true, composed: true }) signOut: EventEmitter<null>;
  @Event({ bubbles: true, composed: true }) screenChanged: EventEmitter<pages>;
  @State() currentPage: TTabsState = null;
  private preferences: { currency: string | null; language: string | null } = { currency: null, language: null };

  private dialogRef: HTMLIrDialogElement;
  private sheetRef: HTMLIrSheetElement;
  private bookingCodeRef: HTMLIrBookingCodeElement;
  modalRef: HTMLIrModalElement;

  componentWillLoad() {
    this.website = app_store.app_data.affiliate ? app_store.app_data.affiliate.sites[0]?.url : this.website;
  }
  @Watch('website')
  handleWebsiteChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.website = app_store.app_data.affiliate ? app_store.app_data.affiliate.sites[0]?.url : newValue;
    }
  }

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
        return <ir-booking-code ref={el => (this.bookingCodeRef = el)} slot="modal-body"></ir-booking-code>;
      case 'map':
        return <ir-google-maps slot="modal-body"></ir-google-maps>;
      case 'profile':
        return (
          <ir-user-profile
            class={'flex-1'}
            user_data={{
              email: checkout_store.userFormData.email,
              first_name: checkout_store.userFormData.firstName,
              last_name: checkout_store.userFormData.lastName,
              country_id: checkout_store.userFormData.country_id,
              mobile: checkout_store.userFormData.mobile_number,
              country_phone_prefix: checkout_store.userFormData.country_phone_prefix.toString(),
            }}
            slot="modal-body"
          ></ir-user-profile>
        );
      default:
        return null;
    }
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
    const c = (0).toLocaleString('en-US', { style: 'currency', currency: currency.code, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\d/g, '').trim();
    this.preferences = {
      currency: `${currency.code} ${c}`,
      language: country?.description,
    };
    return (
      <div class="flex">
        <button type="button" class="ir-language-trigger" onClick={() => this.handleButtonClick(undefined, 'language')}>
          <p>{c}</p>
        </button>
        <button type="button" class="ir-language-trigger" onClick={() => this.handleButtonClick(undefined, 'language')}>
          {/* <ir-icons name="globe"></ir-icons> */}
          <p>{country?.description}</p>
        </button>
      </div>
    );
  }
  private handleSignIn(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (app_store.app_data.injected) {
      return (window.location.href = `https://${app_store.property.perma_link}.bookingmystay.com/signin`);
    }
    this.currentPage = 'auth';
    this.modalRef.openModal();
  }
  async handleItemSelect(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const id = e.detail;
    switch (id) {
      case 1:
        this.screenChanged.emit('booking-listing');
        return this.routing.emit('booking-listing');
      case 2:
        await new AuthService().signOut();
        this.signOut.emit(null);
        return;
      case 3: {
        this.screenChanged.emit('user-profile');
        this.routing.emit('user-profile');
      }
      default:
        return null;
    }
  }
  private showAgentCode() {
    const currentPage = app_store.currentPage;
    return (
      currentPage === 'booking' &&
      this.showBookingCode &&
      app_store.property.agents &&
      app_store.property.roomtypes.filter(rt => rt.rateplans.some(rp => rp.is_targeting_travel_agency)).length > 0
    );
  }
  render() {
    const currentPage = app_store.currentPage;
    const isInjected = app_store.app_data.injected && currentPage === 'booking';
    return (
      <Fragment>
        <nav class="ir-nav">
          <div class="ir-nav-container" data-state={isInjected ? 'injected' : 'default'}>
            {!isInjected && (
              <div class="ir-nav-left">
                <a aria-label="home" target="_blank" href={`https://${this.website}`}>
                  <img
                    src={app_store.app_data?.affiliate ? app_store.app_data?.affiliate.sites[0]?.logo : this.logo}
                    alt={`${app_store.property?.name}, ${app_store.property?.country.name}`}
                    class="ir-nav-logo"
                  ></img>
                </a>
                <div class="ir-nav-property-details">
                  <h3 class="ir-property-name">{app_store.property?.name}</h3>
                  <button onClick={() => this.handleButtonClick(undefined, 'map')} class="ir-property-location">
                    {renderPropertyLocation()}
                    <span class={'mx-1'}></span>
                    <svg slot="btn-icon" xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 384 512">
                      <path
                        fill="currentColor"
                        d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"
                      />
                      <title>{localizedWords.entries.Lcz_Location}</title>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div class={`ir-burger-menu ${isInjected ? 'ir-nav-injected' : ''}`}>
              {!app_store.is_signed_in ? (
                <Fragment>
                  <div class="hidden md:block">
                    <ir-button class="ir-sheet-button" variants="ghost" label="Sign in" name="auth" onButtonClick={this.handleSignIn.bind(this)}></ir-button>
                  </div>
                  <div class="md:hidden">
                    <ir-button class="ir-sheet-button" variants="icon" iconName="circle-user" label="Sign in" name="auth" onButtonClick={this.handleSignIn.bind(this)}></ir-button>
                  </div>
                </Fragment>
              ) : (
                this.menuShown && (
                  <ir-menu
                    data={[
                      { id: 1, item: localizedWords.entries.Lcz_MyBookings },
                      { id: 3, item: localizedWords.entries.Lcz_PersonalProfile },
                      { id: 2, item: localizedWords.entries.Lcz_SignOut },
                    ]}
                    onMenuItemClick={this.handleItemSelect.bind(this)}
                  >
                    <ir-user-avatar slot="menu-trigger"></ir-user-avatar>
                  </ir-menu>
                )
              )}
              {this.showBookingCode && this.showCurrency && <ir-button variants="icon" iconName="burger_menu" onClick={() => this.sheetRef.openSheet()}></ir-button>}
            </div>

            <ul class={cn('ir-nav-links', { 'ir-nav-links-injected': isInjected })}>
              {!isInjected && currentPage !== 'checkout' && (
                <li>
                  <ir-button variants="ghost" haveLeftIcon title={localizedWords.entries.Lcz_Home} onButtonClick={() => window.open(`https://${this.website}`, '_blank')}>
                    <p slot="left-icon" class="sr-only">
                      home
                    </p>
                    <ir-icons slot="left-icon" name={'home'} svgClassName="ir-icon-size"></ir-icons>
                  </ir-button>
                </li>
              )}

              {this.showAgentCode() && (
                <li>
                  {!!booking_store.bookingAvailabilityParams.agent ? (
                    <div class={'flex items-center'}>
                      <p>{booking_store.bookingAvailabilityParams.agent_code}</p>
                      <button
                        title={localizedWords.entries.Lcz_Clear}
                        class={'ir-language-trigger'}
                        onClick={() => {
                          this.bookingCodeRef.clearAgent();
                        }}
                      >
                        <ir-icons name="xmark"></ir-icons>
                      </button>
                    </div>
                  ) : (
                    <ir-button
                      variants="ghost"
                      label={localizedWords.entries.Lcz_BookingCode}
                      name="booking_code"
                      onButtonClick={e => this.handleButtonClick(e, 'booking_code')}
                    ></ir-button>
                  )}
                </li>
              )}
              {this.showCurrency && <li>{this.renderLanguageTrigger()}</li>}
              {!app_store.is_signed_in ? (
                <li>
                  <ir-button variants="ghost" label={localizedWords.entries.Lcz_SignIn} name="auth" onButtonClick={this.handleSignIn.bind(this)}></ir-button>
                </li>
              ) : (
                this.menuShown && (
                  <li>
                    <ir-menu
                      data={[
                        { id: 1, item: localizedWords.entries.Lcz_MyBookings },
                        { id: 3, item: localizedWords.entries.Lcz_PersonalProfile },
                        { id: 2, item: localizedWords.entries.Lcz_SignOut },
                      ]}
                      onMenuItemClick={this.handleItemSelect.bind(this)}
                    >
                      <ir-user-avatar slot="menu-trigger"></ir-user-avatar>
                    </ir-menu>
                  </li>
                )
              )}
            </ul>
          </div>
        </nav>

        <ir-sheet ref={el => (this.sheetRef = el)}>
          <ul slot="sheet-content" class="ir-sheet-content">
            {/* <li>{this.renderLanguageTrigger()}</li> */}
            {!isInjected && (
              <li>
                <ir-button
                  onButtonClick={() => window.open(`https://${this.website}`)}
                  class="ir-sheet-button"
                  buttonClassName="justify-start"
                  variants="ghost"
                  label={localizedWords.entries.Lcz_Home}
                  name="home"
                ></ir-button>
              </li>
            )}
            {!app_store.is_signed_in && (
              <li>
                <ir-button
                  buttonClassName="justify-start"
                  class="ir-sheet-button"
                  variants="ghost"
                  label="Sign in"
                  name="auth"
                  onButtonClick={this.handleSignIn.bind(this)}
                ></ir-button>
              </li>
            )}
            <li>
              <ir-button
                class="ir-sheet-button"
                onButtonClick={() => this.handleButtonClick(undefined, 'language')}
                buttonClassName="justify-start"
                variants="ghost"
                label={this.preferences.currency}
                name="home"
              ></ir-button>
            </li>
            <li>
              <ir-button
                class="ir-sheet-button"
                onButtonClick={() => this.handleButtonClick(undefined, 'language')}
                buttonClassName="justify-start"
                variants="ghost"
                label={this.preferences.language}
                name="home"
              ></ir-button>
            </li>
            {this.showAgentCode() && (
              <li>
                {!!booking_store.bookingAvailabilityParams.agent ? (
                  <div class={'booking-code flex items-center gap-1.5'}>
                    <p class={'text-sm '}>{booking_store.bookingAvailabilityParams.agent_code}</p>
                    <div>
                      <button
                        title={localizedWords.entries.Lcz_Clear}
                        class={'ir-language-trigger'}
                        onClick={() => {
                          this.bookingCodeRef.clearAgent();
                        }}
                      >
                        <ir-icons name="xmark"></ir-icons>
                      </button>
                    </div>
                  </div>
                ) : (
                  <ir-button
                    variants="ghost"
                    label={localizedWords.entries.Lcz_BookingCode}
                    name="booking_code"
                    onButtonClick={e => this.handleButtonClick(e, 'booking_code')}
                  ></ir-button>
                )}
              </li>
            )}
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
