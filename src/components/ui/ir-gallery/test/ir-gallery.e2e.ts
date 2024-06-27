import { newE2EPage } from '@stencil/core/testing';

describe('ir-gallery', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-gallery></ir-gallery>');

    const element = await page.find('ir-gallery');
    expect(element).toHaveClass('hydrated');
  });
});
