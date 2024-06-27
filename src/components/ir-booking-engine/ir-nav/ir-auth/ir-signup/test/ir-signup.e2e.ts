import { newE2EPage } from '@stencil/core/testing';

describe('ir-signup', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-signup></ir-signup>');

    const element = await page.find('ir-signup');
    expect(element).toHaveClass('hydrated');
  });
});
