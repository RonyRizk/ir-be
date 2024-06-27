import { newE2EPage } from '@stencil/core/testing';

describe('ir-language-picker', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-language-picker></ir-language-picker>');

    const element = await page.find('ir-language-picker');
    expect(element).toHaveClass('hydrated');
  });
});
