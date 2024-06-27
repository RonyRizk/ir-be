import { newE2EPage } from '@stencil/core/testing';

describe('ir-rateplan', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-rateplan></ir-rateplan>');

    const element = await page.find('ir-rateplan');
    expect(element).toHaveClass('hydrated');
  });
});
