import { newSpecPage } from '@stencil/core/testing';
import { IrCheckoutSkeleton } from '../ir-checkout-skeleton';

describe('ir-checkout-skeleton', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCheckoutSkeleton],
      html: `<ir-checkout-skeleton></ir-checkout-skeleton>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-checkout-skeleton>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-checkout-skeleton>
    `);
  });
});
