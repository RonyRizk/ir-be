import { newSpecPage } from '@stencil/core/testing';
import { IrPaymentView } from '../ir-payment-view';

describe('ir-payment-view', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPaymentView],
      html: `<ir-payment-view></ir-payment-view>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-payment-view>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-payment-view>
    `);
  });
});
