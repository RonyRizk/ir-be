import { newE2EPage } from '@stencil/core/testing';

describe('ir-modal', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-modal></ir-modal>');

    const element = await page.find('ir-modal');
    expect(element).toHaveClass('hydrated');
  });
});
