import { newE2EPage } from '@stencil/core/testing';

describe('ir-guest-counter', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-guest-counter></ir-guest-counter>');

    const element = await page.find('ir-guest-counter');
    expect(element).toHaveClass('hydrated');
  });
});
