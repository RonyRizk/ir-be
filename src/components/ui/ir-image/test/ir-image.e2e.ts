import { newE2EPage } from '@stencil/core/testing';

describe('ir-image', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-image></ir-image>');

    const element = await page.find('ir-image');
    expect(element).toHaveClass('hydrated');
  });
});
