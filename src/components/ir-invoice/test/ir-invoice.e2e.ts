import { newE2EPage } from '@stencil/core/testing';

describe('ir-invoice', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-invoice></ir-invoice>');

    const element = await page.find('ir-invoice');
    expect(element).toHaveClass('hydrated');
  });
});
