import BeLogoFooter from '@/assets/be_logo_footer';
import app_store from '@/stores/app.store';
import localizedWords from '@/stores/localization.store';
import { renderPropertyLocation } from '@/utils/utils';
import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

@Component({
  tag: 'ir-footer',
  styleUrl: 'ir-footer.css',
  shadow: true,
})
export class IrFooter {
  @Prop() version: string;

  @Event() openPrivacyPolicy: EventEmitter<null>;
  private socials = {
    '006': 'whatsapp',
    '002': 'instagram',
    '001': 'facebook',
    '005': 'skype',
    '004': 'youtube',
    '003': 'twitter',
  };

  contactDialog: HTMLIrDialogElement;

  renderLocationField(field: string | null, withComma: boolean = true) {
    if (!field) {
      return '';
    }
    return withComma ? `, ${field}` : field;
  }

  renderPropertyEmail() {
    let { email } = app_store.property?.contacts?.find(c => c.type === 'booking');
    if (!email) {
      return null;
    }
    if (app_store.app_data.affiliate) {
      email = app_store.app_data.affiliate.email;
    }
    return (
      <div class="contact-info">
        <label>{localizedWords.entries.Lcz_EmailAddress}:</label>
        <a href={`mailto:${email}`} class="contact-link">
          {email}
        </a>
      </div>
    );
  }
  getPhoneNumber() {
    let country_prefix = app_store.property?.country?.phone_prefix || '';
    let mobile = app_store.property?.phone;
    if (app_store.app_data.affiliate) {
      country_prefix = app_store.app_data.affiliate.country.phone_prefix;
      mobile = app_store.app_data.affiliate.phone;
    }
    return [country_prefix, mobile];
  }
  render() {
    return (
      <footer class="footer">
        <ul class="footer-list">
          <li class="footer-item">
            <p class="footer-text">{app_store.app_data.affiliate ? app_store.app_data.affiliate.name : app_store.property?.name}</p>
            <span>-</span>
            <ir-button onButtonClick={() => this.contactDialog.openModal()} buttonStyles={{ padding: '0' }} variants="link" label={localizedWords.entries.Lcz_Contact}></ir-button>
            <span>-</span>
            <ir-button
              label={localizedWords.entries.Lcz_PrivacyPolicy}
              buttonStyles={{ padding: '0', background: 'transparent' }}
              variants="link"
              onButtonClick={() => this.openPrivacyPolicy.emit(null)}
            ></ir-button>
            {/* <ir-privacy-policy label={localizedWords.entries.Lcz_PrivacyPolicy} policyTriggerStyle={{  }}></ir-privacy-policy> */}
          </li>
          <li class="social-media">
            {app_store.property?.social_media.map(media => {
              if (media.link === '') {
                return null;
              }
              const href = media.code === '006' ? `https://api.whatsapp.com/send/?phone=${media.link}` : media.link;
              if (!this.socials[media.code]) {
                return null;
              }
              return (
                <a target="_blank" href={href} title={media?.name} class="social-link">
                  <ir-icons name={this.socials[media.code] as any}></ir-icons>
                </a>
              );
            })}
          </li>
          <li>
            <p class="text-end text-xs text-gray-400">V{this.version} - Powered by</p>
            <a href="https://info.igloorooms.com/" target="_blank" title="igloorooms cloud booking solutions for hotels">
              <BeLogoFooter width={110} height={'auto'} />
            </a>
          </li>
        </ul>
        <ir-dialog closeButton ref={el => (this.contactDialog = el)} style={{ '--ir-dialog-max-width': '25rem' }}>
          <div class="dialog-body" slot="modal-body">
            <h1 class="dialog-title">{localizedWords.entries.Lcz_ContactInformation}</h1>
            <div class="contact-info">
              <span>
                <label>{localizedWords.entries.Lcz_Address}:</label>
              </span>
              <div>{renderPropertyLocation()}</div>
            </div>
            <div class="contact-info">
              <span>
                <label>{localizedWords.entries.Lcz_Phone}</label>
              </span>
              <a class="contact-link" href={`tel:${this.getPhoneNumber().join('')}`}>
                {this.getPhoneNumber().join(' ')}
              </a>
            </div>
            {this.renderPropertyEmail()}
          </div>
        </ir-dialog>
      </footer>
    );
  }
}
