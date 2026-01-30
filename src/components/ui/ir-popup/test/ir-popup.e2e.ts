import { newE2EPage } from '@stencil/core/testing';

describe('ir-popup', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-popup></ir-popup>');

    const element = await page.find('ir-popup');
    expect(element).toHaveClass('hydrated');
  });
});
