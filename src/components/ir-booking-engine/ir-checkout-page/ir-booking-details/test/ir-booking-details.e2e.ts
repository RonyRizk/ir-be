import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-details', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-details></ir-booking-details>');

    const element = await page.find('ir-booking-details');
    expect(element).toHaveClass('hydrated');
  });
});
