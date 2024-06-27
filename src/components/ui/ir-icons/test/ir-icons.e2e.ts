import { newE2EPage } from '@stencil/core/testing';

describe('ir-icons', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-icons></ir-icons>');

    const element = await page.find('ir-icons');
    expect(element).toHaveClass('hydrated');
  });
});
