import { newE2EPage } from '@stencil/core/testing';

describe('ir-widget-date-popup', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-widget-date-popup></ir-widget-date-popup>');

    const element = await page.find('ir-widget-date-popup');
    expect(element).toHaveClass('hydrated');
  });
});
