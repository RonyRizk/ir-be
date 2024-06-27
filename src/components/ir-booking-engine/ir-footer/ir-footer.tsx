import BeLogoFooter from '@/assets/be_logo_footer';
import app_store from '@/stores/app.store';
import { Component, h } from '@stencil/core';

@Component({
  tag: 'ir-footer',
  styleUrl: 'ir-footer.css',
  shadow: true,
})
export class IrFooter {
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
    const { email } = app_store.property?.contacts?.find(c => c.type === 'booking');
    if (!email) {
      return null;
    }
    return (
      <div class="contact-info">
        <label>Email:</label>
        <a href={`mailto:${email}`} class="contact-link">
          {email}
        </a>
      </div>
    );
  }

  render() {
    return (
      <footer class="footer">
        <ul class="footer-list">
          <li class="footer-item">
            <p class="footer-text">{app_store.property?.name}</p>
            <span>-</span>
            <ir-button onButtonClick={() => this.contactDialog.openModal()} buttonStyles={{ padding: '0' }} variants="link" label="Contact"></ir-button>
            <span>-</span>
            <ir-privacy-policy label="Policy"></ir-privacy-policy>
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
            <a href="https://info.igloorooms.com/" target="_blank" title="igloorooms cloud booking solutions for hotels">
              <BeLogoFooter width={120} height={40} />
            </a>
          </li>
        </ul>
        <ir-dialog closeButton ref={el => (this.contactDialog = el)} style={{ '--ir-dialog-max-width': '25rem' }}>
          <div class="dialog-body" slot="modal-body">
            <h1 class="dialog-title">Contact information</h1>
            <div class="contact-info">
              <span>
                <label>Address:</label>
              </span>
              <div>
                {this.renderLocationField(app_store.property?.city.name, false)}
                {this.renderLocationField(app_store.property?.area)}
                {this.renderLocationField(app_store.property?.postal)}
                {this.renderLocationField(app_store.property?.country.name)}
              </div>
            </div>
            <div class="contact-info">
              <span>
                <label>Phone:</label>
              </span>
              <a class="contact-link" href={`tel:${app_store.property?.phone}`}>
                {app_store.property?.country?.phone_prefix || ''} {app_store.property?.phone}
              </a>
            </div>
            {this.renderPropertyEmail()}
          </div>
        </ir-dialog>
      </footer>
    );
  }
}
