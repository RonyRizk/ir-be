import { newE2EPage } from '@stencil/core/testing';

describe('ir-booking-details-view', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-booking-details-view></ir-booking-details-view>');

    const element = await page.find('ir-booking-details-view');
    expect(element).toHaveClass('hydrated');
  });
});
