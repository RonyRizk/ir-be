import { newE2EPage } from '@stencil/core/testing';

describe('ir-pagination', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-pagination></ir-pagination>');

    const element = await page.find('ir-pagination');
    expect(element).toHaveClass('hydrated');
  });
});
