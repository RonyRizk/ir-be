import { newSpecPage } from '@stencil/core/testing';
import { IrGallery } from '../ir-gallery';

describe('ir-gallery', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrGallery],
      html: `<ir-gallery></ir-gallery>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-gallery>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-gallery>
    `);
  });
});
