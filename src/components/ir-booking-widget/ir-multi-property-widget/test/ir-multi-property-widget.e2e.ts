import { newE2EPage } from '@stencil/core/testing';

describe('ir-multi-property-widget', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-multi-property-widget></ir-multi-property-widget>');

    const element = await page.find('ir-multi-property-widget');
    expect(element).toHaveClass('hydrated');
  });
});
