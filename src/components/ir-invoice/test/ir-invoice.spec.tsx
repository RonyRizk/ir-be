import { newSpecPage } from '@stencil/core/testing';
import { IrInvoice } from '../ir-invoice';

describe('ir-invoice', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrInvoice],
      html: `<ir-invoice></ir-invoice>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-invoice>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-invoice>
    `);
  });
});
