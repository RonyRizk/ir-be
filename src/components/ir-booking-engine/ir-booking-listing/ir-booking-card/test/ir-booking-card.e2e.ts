import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-card', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-card></ir-booking-card>');

    const element = await page.find('ir-booking-card');
    expect(element).toHaveClass('hydrated');
  });
});
