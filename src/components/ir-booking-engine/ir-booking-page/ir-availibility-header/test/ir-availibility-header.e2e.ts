import { newE2EPage } from '@stencil/core/testing';

describe('ir-availibility-header', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-availibility-header></ir-availibility-header>');

    const element = await page.find('ir-availibility-header');
    expect(element).toHaveClass('hydrated');
  });
});
