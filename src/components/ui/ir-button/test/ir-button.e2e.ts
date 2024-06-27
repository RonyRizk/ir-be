import { newE2EPage } from '@stencil/core/testing';

describe('ir-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-button></ir-button>');

    const element = await page.find('ir-button');
    expect(element).toHaveClass('hydrated');
  });
});
