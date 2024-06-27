import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-engine', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-engine></ir-booking-engine>');

    const element = await page.find('ir-booking-engine');
    expect(element).toHaveClass('hydrated');
  });
});
