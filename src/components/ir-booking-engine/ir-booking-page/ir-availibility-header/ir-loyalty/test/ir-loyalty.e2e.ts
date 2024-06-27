import { newE2EPage } from '@stencil/core/testing';

describe('ir-loyalty', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-loyalty></ir-loyalty>');

    const element = await page.find('ir-loyalty');
    expect(element).toHaveClass('hydrated');
  });
});
