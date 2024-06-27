import { newE2EPage } from '@stencil/core/testing';

describe('ir-room-type-amenities', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-room-type-amenities></ir-room-type-amenities>');

    const element = await page.find('ir-room-type-amenities');
    expect(element).toHaveClass('hydrated');
  });
});
