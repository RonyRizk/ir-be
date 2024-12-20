import { newSpecPage } from '@stencil/core/testing';
import { IrImage } from '../ir-image';

describe('ir-image', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrImage],
      html: `<ir-image></ir-image>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-image>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-image>
    `);
  });
});
