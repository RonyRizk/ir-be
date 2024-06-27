import { newE2EPage } from '@stencil/core/testing';

describe('ir-tooltip', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-tooltip></ir-tooltip>');

    const element = await page.find('ir-tooltip');
    expect(element).toHaveClass('hydrated');
  });
});
