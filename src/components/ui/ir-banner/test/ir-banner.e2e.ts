import { newE2EPage } from '@stencil/core/testing';

describe('ir-banner', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-banner></ir-banner>');

    const element = await page.find('ir-banner');
    expect(element).toHaveClass('hydrated');
  });
});
