import { newE2EPage } from '@stencil/core/testing';

describe('ir-phone-input', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-phone-input></ir-phone-input>');

    const element = await page.find('ir-phone-input');
    expect(element).toHaveClass('hydrated');
  });
});
