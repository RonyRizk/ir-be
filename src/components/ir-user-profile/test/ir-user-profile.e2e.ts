import { newE2EPage } from '@stencil/core/testing';

describe('ir-user-profile', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-user-profile></ir-user-profile>');

    const element = await page.find('ir-user-profile');
    expect(element).toHaveClass('hydrated');
  });
});
