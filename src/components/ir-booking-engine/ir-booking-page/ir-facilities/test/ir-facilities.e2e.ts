import { newE2EPage } from '@stencil/core/testing';

describe('ir-facilities', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-facilities></ir-facilities>');

    const element = await page.find('ir-facilities');
    expect(element).toHaveClass('hydrated');
  });
});
