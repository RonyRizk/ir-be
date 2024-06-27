import { newE2EPage } from '@stencil/core/testing';

describe('ir-radio', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-radio></ir-radio>');

    const element = await page.find('ir-radio');
    expect(element).toHaveClass('hydrated');
  });
});
