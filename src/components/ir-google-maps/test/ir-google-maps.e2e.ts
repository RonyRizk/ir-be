import { newE2EPage } from '@stencil/core/testing';

describe('ir-google-maps', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-google-maps></ir-google-maps>');

    const element = await page.find('ir-google-maps');
    expect(element).toHaveClass('hydrated');
  });
});
