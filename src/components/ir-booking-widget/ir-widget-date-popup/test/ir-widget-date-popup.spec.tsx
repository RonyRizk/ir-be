import { newSpecPage } from '@stencil/core/testing';
import { IrWidgetDatePopup } from '../ir-widget-date-popup';

describe('ir-widget-date-popup', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrWidgetDatePopup],
      html: `<ir-widget-date-popup></ir-widget-date-popup>`,
    });
    expect(page.root.shadowRoot.querySelector('ir-popup')).toBeTruthy();
  });
});
