import { newSpecPage } from '@stencil/core/testing';
import { IrBadgeGroup } from '../ir-badge-group';

describe('ir-badge-group', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBadgeGroup],
      html: `<ir-badge-group></ir-badge-group>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-badge-group>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-badge-group>
    `);
  });
});
