import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-overview', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-overview></ir-booking-overview>');

    const element = await page.find('ir-booking-overview');
    expect(element).toHaveClass('hydrated');
  });
});
