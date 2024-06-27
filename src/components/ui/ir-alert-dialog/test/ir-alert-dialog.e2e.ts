import { newE2EPage } from '@stencil/core/testing';

describe('ir-alert-dialog', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-alert-dialog></ir-alert-dialog>');

    const element = await page.find('ir-alert-dialog');
    expect(element).toHaveClass('hydrated');
  });
});
