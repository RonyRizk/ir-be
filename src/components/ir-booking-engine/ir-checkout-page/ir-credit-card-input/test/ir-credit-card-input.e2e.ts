import { newE2EPage } from '@stencil/core/testing';

describe('ir-credit-card-input', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-credit-card-input></ir-credit-card-input>');

    const element = await page.find('ir-credit-card-input');
    expect(element).toHaveClass('hydrated');
  });
});
