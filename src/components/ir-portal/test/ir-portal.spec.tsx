import { newSpecPage } from '@stencil/core/testing';
import { IrPortal } from '../ir-portal';

describe('ir-portal', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPortal],
      html: `<ir-portal></ir-portal>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-portal>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-portal>
    `);
  });
});
