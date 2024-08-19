import { newE2EPage } from '@stencil/core/testing';

describe('ir-home-loader', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-home-loader></ir-home-loader>');

    const element = await page.find('ir-home-loader');
    expect(element).toHaveClass('hydrated');
  });
});
