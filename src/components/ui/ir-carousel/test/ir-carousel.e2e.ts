import { newE2EPage } from '@stencil/core/testing';

describe('ir-carousel', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-carousel></ir-carousel>');

    const element = await page.find('ir-carousel');
    expect(element).toHaveClass('hydrated');
  });
});
