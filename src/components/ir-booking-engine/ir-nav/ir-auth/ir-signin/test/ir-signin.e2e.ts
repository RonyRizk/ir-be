import { newE2EPage } from '@stencil/core/testing';

describe('ir-signin', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-signin></ir-signin>');

    const element = await page.find('ir-signin');
    expect(element).toHaveClass('hydrated');
  });
});
