import { newE2EPage } from '@stencil/core/testing';

describe('ir-badge', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-badge></ir-badge>');

    const element = await page.find('ir-badge');
    expect(element).toHaveClass('hydrated');
  });
});
