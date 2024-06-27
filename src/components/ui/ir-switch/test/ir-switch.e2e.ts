import { newE2EPage } from '@stencil/core/testing';

describe('ir-switch', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-switch></ir-switch>');

    const element = await page.find('ir-switch');
    expect(element).toHaveClass('hydrated');
  });
});
