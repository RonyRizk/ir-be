import { newSpecPage } from '@stencil/core/testing';
import { IrPagination } from '../ir-pagination';

describe('ir-pagination', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPagination],
      html: `<ir-pagination></ir-pagination>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-pagination>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-pagination>
    `);
  });
});
