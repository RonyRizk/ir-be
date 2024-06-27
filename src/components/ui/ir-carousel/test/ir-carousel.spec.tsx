import { newSpecPage } from '@stencil/core/testing';
import { IrCarousel } from '../ir-carousel';

describe('ir-carousel', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCarousel],
      html: `<ir-carousel></ir-carousel>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-carousel>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-carousel>
    `);
  });
});
