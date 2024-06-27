import { newE2EPage } from '@stencil/core/testing';

describe('ir-nav', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-nav></ir-nav>');

    const element = await page.find('ir-nav');
    expect(element).toHaveClass('hydrated');
  });
});
