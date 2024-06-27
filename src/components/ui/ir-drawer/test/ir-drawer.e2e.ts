import { newE2EPage } from '@stencil/core/testing';

describe('ir-drawer', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-drawer></ir-drawer>');

    const element = await page.find('ir-drawer');
    expect(element).toHaveClass('hydrated');
  });
});
