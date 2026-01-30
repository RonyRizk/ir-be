import { newSpecPage } from '@stencil/core/testing';
import { IrMultiPropertyWidget } from '../ir-multi-property-widget';

describe('ir-multi-property-widget', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrMultiPropertyWidget],
      html: `<ir-multi-property-widget></ir-multi-property-widget>`,
    });
    expect(page.root.shadowRoot.querySelector('ir-popup')).toBeTruthy();
  });
});
