import { newE2EPage } from '@stencil/core/testing';

describe('ir-user-avatar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-user-avatar></ir-user-avatar>');

    const element = await page.find('ir-user-avatar');
    expect(element).toHaveClass('hydrated');
  });
});
