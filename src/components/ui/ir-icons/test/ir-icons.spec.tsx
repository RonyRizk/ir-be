import { newSpecPage } from '@stencil/core/testing';
import { IrIcons } from '../ir-icons';

describe('ir-icons', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrIcons],
      html: `<ir-icons></ir-icons>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-icons>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-icons>
    `);
  });
});
