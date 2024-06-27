import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-code', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-code></ir-booking-code>');

    const element = await page.find('ir-booking-code');
    expect(element).toHaveClass('hydrated');
  });
});
