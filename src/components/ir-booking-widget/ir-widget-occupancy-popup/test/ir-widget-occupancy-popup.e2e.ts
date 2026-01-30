import { newE2EPage } from '@stencil/core/testing';

describe('ir-widget-occupancy-popup', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-widget-occupancy-popup></ir-widget-occupancy-popup>');

    const element = await page.find('ir-widget-occupancy-popup');
    expect(element).toHaveClass('hydrated');
  });
});
