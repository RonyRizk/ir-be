import { newSpecPage } from '@stencil/core/testing';
import { IrBadge } from '../ir-badge';

describe('ir-badge', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBadge],
      html: `<ir-badge></ir-badge>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-badge>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-badge>
    `);
  });
});
