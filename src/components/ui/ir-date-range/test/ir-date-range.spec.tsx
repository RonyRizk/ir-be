import { newSpecPage } from '@stencil/core/testing';
import { IrDateRange } from '../ir-date-range';

describe('ir-date-range', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDateRange],
      html: `<ir-date-range></ir-date-range>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-date-range>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-date-range>
    `);
  });
});
