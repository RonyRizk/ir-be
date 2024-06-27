import { newSpecPage } from '@stencil/core/testing';
import { IrSheet } from '../ir-sheet';

describe('ir-sheet', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSheet],
      html: `<ir-sheet></ir-sheet>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-sheet>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-sheet>
    `);
  });
});
