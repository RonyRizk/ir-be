import { newSpecPage } from '@stencil/core/testing';
import { IrRoomtype } from '../ir-roomtype';

describe('ir-roomtype', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRoomtype],
      html: `<ir-roomtype></ir-roomtype>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-roomtype>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-roomtype>
    `);
  });
});
