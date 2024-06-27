import { newE2EPage } from '@stencil/core/testing';

describe('ir-accomodations', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-accomodations></ir-accomodations>');

    const element = await page.find('ir-accomodations');
    expect(element).toHaveClass('hydrated');
  });
});
