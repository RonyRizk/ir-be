import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-header', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-header></ir-booking-header>');

    const element = await page.find('ir-booking-header');
    expect(element).toHaveClass('hydrated');
  });
});
