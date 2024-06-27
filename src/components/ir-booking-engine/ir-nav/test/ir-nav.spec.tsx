import { newSpecPage } from '@stencil/core/testing';
import { IrNav } from '../ir-nav';

describe('ir-nav', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrNav],
      html: `<ir-nav></ir-nav>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-nav>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-nav>
    `);
  });
});
