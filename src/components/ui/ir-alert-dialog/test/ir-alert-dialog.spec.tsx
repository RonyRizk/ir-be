import { newSpecPage } from '@stencil/core/testing';
import { IrAlertDialog } from '../ir-alert-dialog';

describe('ir-alert-dialog', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrAlertDialog],
      html: `<ir-alert-dialog></ir-alert-dialog>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-alert-dialog>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-alert-dialog>
    `);
  });
});
