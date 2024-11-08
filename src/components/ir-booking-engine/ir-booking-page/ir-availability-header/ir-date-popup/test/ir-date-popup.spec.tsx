import { newSpecPage } from '@stencil/core/testing';
import { IrDatePopup } from '../ir-date-popup';

describe('ir-date-popup', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDatePopup],
      html: `<ir-date-popup></ir-date-popup>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-date-popup>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-date-popup>
    `);
  });
});
