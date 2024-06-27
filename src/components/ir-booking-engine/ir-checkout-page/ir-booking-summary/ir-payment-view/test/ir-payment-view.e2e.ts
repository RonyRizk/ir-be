import { newE2EPage } from '@stencil/core/testing';

describe('ir-payment-view', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-payment-view></ir-payment-view>');

    const element = await page.find('ir-payment-view');
    expect(element).toHaveClass('hydrated');
  });
});
