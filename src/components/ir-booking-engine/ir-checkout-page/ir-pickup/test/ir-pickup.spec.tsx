import { newSpecPage } from '@stencil/core/testing';
import { IrPickup } from '../ir-pickup';

describe('ir-pickup', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPickup],
      html: `<ir-pickup></ir-pickup>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-pickup>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-pickup>
    `);
  });
});
