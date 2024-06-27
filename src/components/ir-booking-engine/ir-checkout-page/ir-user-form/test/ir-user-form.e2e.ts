import { newE2EPage } from '@stencil/core/testing';

describe('ir-user-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-user-form></ir-user-form>');

    const element = await page.find('ir-user-form');
    expect(element).toHaveClass('hydrated');
  });
});
