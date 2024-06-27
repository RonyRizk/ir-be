import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-page', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-page></ir-booking-page>');

    const element = await page.find('ir-booking-page');
    expect(element).toHaveClass('hydrated');
  });
});
