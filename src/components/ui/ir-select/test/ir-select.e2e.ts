import { newE2EPage } from '@stencil/core/testing';

describe('ir-select', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-select></ir-select>');

    const element = await page.find('ir-select');
    expect(element).toHaveClass('hydrated');
  });
});
