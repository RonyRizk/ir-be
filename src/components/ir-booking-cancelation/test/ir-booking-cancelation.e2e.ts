import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-cancelation', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-cancelation></ir-booking-cancelation>');

    const element = await page.find('ir-booking-cancelation');
    expect(element).toHaveClass('hydrated');
  });
});
