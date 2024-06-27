import { newE2EPage } from '@stencil/core/testing';

describe('ir-auth', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-auth></ir-auth>');

    const element = await page.find('ir-auth');
    expect(element).toHaveClass('hydrated');
  });
});
