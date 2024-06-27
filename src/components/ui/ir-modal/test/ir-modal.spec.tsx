import { newSpecPage } from '@stencil/core/testing';
import { IrModal } from '../ir-modal';

describe('ir-modal', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrModal],
      html: `<ir-modal></ir-modal>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-modal>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-modal>
    `);
  });
});
