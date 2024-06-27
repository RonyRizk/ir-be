import { newSpecPage } from '@stencil/core/testing';
import { IrCheckoutPage } from '../ir-checkout-page';

describe('ir-checkout-page', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCheckoutPage],
      html: `<ir-checkout-page></ir-checkout-page>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-checkout-page>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-checkout-page>
    `);
  });
});
