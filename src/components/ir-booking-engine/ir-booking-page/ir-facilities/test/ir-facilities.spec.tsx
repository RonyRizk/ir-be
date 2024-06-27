import { newSpecPage } from '@stencil/core/testing';
import { IrFacilities } from '../ir-facilities';

describe('ir-facilities', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrFacilities],
      html: `<ir-facilities></ir-facilities>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-facilities>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-facilities>
    `);
  });
});
