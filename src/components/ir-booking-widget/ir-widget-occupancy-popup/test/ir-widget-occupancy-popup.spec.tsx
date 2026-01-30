import { newSpecPage } from '@stencil/core/testing';
import { IrWidgetOccupancyPopup } from '../ir-widget-occupancy-popup';

describe('ir-widget-occupancy-popup', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrWidgetOccupancyPopup],
      html: `<ir-widget-occupancy-popup></ir-widget-occupancy-popup>`,
    });
    expect(page.root.shadowRoot.querySelector('ir-popup')).toBeTruthy();
  });
});
