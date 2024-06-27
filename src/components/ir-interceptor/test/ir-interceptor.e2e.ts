import { newE2EPage } from '@stencil/core/testing';

describe('ir-interceptor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-interceptor></ir-interceptor>');

    const element = await page.find('ir-interceptor');
    expect(element).toHaveClass('hydrated');
  });
});
