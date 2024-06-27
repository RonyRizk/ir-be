import { newE2EPage } from '@stencil/core/testing';

describe('ir-pickup', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-pickup></ir-pickup>');

    const element = await page.find('ir-pickup');
    expect(element).toHaveClass('hydrated');
  });
});
