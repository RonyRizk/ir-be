import { newSpecPage } from '@stencil/core/testing';
import { IrGoogleMaps } from '../ir-google-maps';

describe('ir-google-maps', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrGoogleMaps],
      html: `<ir-google-maps></ir-google-maps>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-google-maps>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-google-maps>
    `);
  });
});
