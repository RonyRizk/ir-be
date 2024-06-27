import { newE2EPage } from '@stencil/core/testing';

describe('ir-checkout-skeleton', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-checkout-skeleton></ir-checkout-skeleton>');

    const element = await page.find('ir-checkout-skeleton');
    expect(element).toHaveClass('hydrated');
  });
});
