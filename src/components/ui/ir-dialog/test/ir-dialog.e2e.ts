import { newE2EPage } from '@stencil/core/testing';

describe('ir-dialog', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-dialog></ir-dialog>');

    const element = await page.find('ir-dialog');
    expect(element).toHaveClass('hydrated');
  });
});
