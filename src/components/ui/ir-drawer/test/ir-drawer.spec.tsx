import { newSpecPage } from '@stencil/core/testing';
import { IrDrawer } from '../ir-drawer';

describe('ir-drawer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDrawer],
      html: `<ir-drawer></ir-drawer>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-drawer>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-drawer>
    `);
  });
});
