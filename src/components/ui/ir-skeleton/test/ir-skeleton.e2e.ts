import { newE2EPage } from '@stencil/core/testing';

describe('ir-skeleton', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-skeleton></ir-skeleton>');

    const element = await page.find('ir-skeleton');
    expect(element).toHaveClass('hydrated');
  });
});
