import { newE2EPage } from '@stencil/core/testing';

describe('ir-sheet', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<ir-sheet></ir-sheet>');

    const element = await page.find('ir-sheet');
    expect(element).toHaveClass('hydrated');
  });
});
