import { newSpecPage } from '@stencil/core/testing';
import { IrDialog } from '../ir-dialog';

describe('ir-dialog', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrDialog],
      html: `<ir-dialog></ir-dialog>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-dialog>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-dialog>
    `);
  });
});
