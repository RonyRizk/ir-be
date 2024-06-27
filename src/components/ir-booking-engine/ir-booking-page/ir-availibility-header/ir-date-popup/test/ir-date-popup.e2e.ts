import { newE2EPage } from '@stencil/core/testing';

describe('ir-date-popup', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-date-popup></ir-date-popup>');

    const element = await page.find('ir-date-popup');
    expect(element).toHaveClass('hydrated');
  });
});
