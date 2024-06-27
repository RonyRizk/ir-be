import { newE2EPage } from '@stencil/core/testing';

describe('ir-date-range', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-date-range></ir-date-range>');

    const element = await page.find('ir-date-range');
    expect(element).toHaveClass('hydrated');
  });
});
