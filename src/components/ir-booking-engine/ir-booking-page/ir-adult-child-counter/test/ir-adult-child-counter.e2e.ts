import { newE2EPage } from '@stencil/core/testing';

describe('ir-adult-child-counter', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-adult-child-counter></ir-adult-child-counter>');

    const element = await page.find('ir-adult-child-counter');
    expect(element).toHaveClass('hydrated');
  });
});
