import { newE2EPage } from '@stencil/core/testing';

describe('ir-seo-injector', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-seo-injector></ir-seo-injector>');

    const element = await page.find('ir-seo-injector');
    expect(element).toHaveClass('hydrated');
  });
});
