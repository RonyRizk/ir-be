import { newSpecPage } from '@stencil/core/testing';
import { IrSkeleton } from '../ir-skeleton';

describe('ir-skeleton', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSkeleton],
      html: `<ir-skeleton></ir-skeleton>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-skeleton>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-skeleton>
    `);
  });
});
