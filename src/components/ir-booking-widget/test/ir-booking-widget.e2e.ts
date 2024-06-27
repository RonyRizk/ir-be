import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-widget', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-widget></ir-booking-widget>');

    const element = await page.find('ir-booking-widget');
    expect(element).toHaveClass('hydrated');
  });
});
