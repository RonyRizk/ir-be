import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-summary', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-summary></ir-booking-summary>');

    const element = await page.find('ir-booking-summary');
    expect(element).toHaveClass('hydrated');
  });
});
