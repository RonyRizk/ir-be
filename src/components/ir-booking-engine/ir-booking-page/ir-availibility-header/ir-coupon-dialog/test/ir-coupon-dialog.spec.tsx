import { newSpecPage } from '@stencil/core/testing';
import { IrCouponDialog } from '../ir-coupon-dialog';

describe('ir-coupon-dialog', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCouponDialog],
      html: `<ir-coupon-dialog></ir-coupon-dialog>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-coupon-dialog>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-coupon-dialog>
    `);
  });
});
