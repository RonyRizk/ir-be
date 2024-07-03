import { newE2EPage } from '@stencil/core/testing';

describe('ir-portal', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-portal></ir-portal>');

    const element = await page.find('ir-portal');
    expect(element).toHaveClass('hydrated');
  });
});
