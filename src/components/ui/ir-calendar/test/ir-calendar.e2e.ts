import { newE2EPage } from '@stencil/core/testing';

describe('ir-calendar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-calendar></ir-calendar>');

    const element = await page.find('ir-calendar');
    expect(element).toHaveClass('hydrated');
  });
});
