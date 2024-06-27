import { newE2EPage } from '@stencil/core/testing';

describe('ir-roomtype', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-roomtype></ir-roomtype>');

    const element = await page.find('ir-roomtype');
    expect(element).toHaveClass('hydrated');
  });
});
