import { newE2EPage } from '@stencil/core/testing';

describe('ir-coupon-dialog', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-coupon-dialog></ir-coupon-dialog>');

    const element = await page.find('ir-coupon-dialog');
    expect(element).toHaveClass('hydrated');
  });
});
