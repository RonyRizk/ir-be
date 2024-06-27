import { newE2EPage } from '@stencil/core/testing';

describe('ir-input', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-input></ir-input>');

    const element = await page.find('ir-input');
    expect(element).toHaveClass('hydrated');
  });
});
