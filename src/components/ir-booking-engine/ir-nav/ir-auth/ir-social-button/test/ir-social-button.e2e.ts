import { newE2EPage } from '@stencil/core/testing';

describe('ir-social-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-social-button></ir-social-button>');

    const element = await page.find('ir-social-button');
    expect(element).toHaveClass('hydrated');
  });
});
