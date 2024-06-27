import { newE2EPage } from '@stencil/core/testing';

describe('ir-checkout-page', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-checkout-page></ir-checkout-page>');

    const element = await page.find('ir-checkout-page');
    expect(element).toHaveClass('hydrated');
  });
});
