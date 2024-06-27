import { newSpecPage } from '@stencil/core/testing';
import { IrTooltip } from '../ir-tooltip';

describe('ir-tooltip', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTooltip],
      html: `<ir-tooltip></ir-tooltip>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-tooltip>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-tooltip>
    `);
  });
});
