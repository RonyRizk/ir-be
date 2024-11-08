import { newSpecPage } from '@stencil/core/testing';
import { IrLoyalty } from '../ir-loyalty';

describe('ir-loyalty', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrLoyalty],
      html: `<ir-loyalty></ir-loyalty>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-loyalty>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-loyalty>
    `);
  });
});
