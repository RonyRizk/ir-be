import { newE2EPage } from '@stencil/core/testing';

describe('ir-privacy-policy', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-privacy-policy></ir-privacy-policy>');

    const element = await page.find('ir-privacy-policy');
    expect(element).toHaveClass('hydrated');
  });
});
