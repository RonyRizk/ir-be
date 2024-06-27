import { newE2EPage } from '@stencil/core/testing';

describe('ir-textarea', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-textarea></ir-textarea>');

    const element = await page.find('ir-textarea');
    expect(element).toHaveClass('hydrated');
  });
});
