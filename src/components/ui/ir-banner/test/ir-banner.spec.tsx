import { newSpecPage } from '@stencil/core/testing';
import { IrBanner } from '../ir-banner';

describe('ir-banner', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBanner],
      html: `<ir-banner></ir-banner>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-banner>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-banner>
    `);
  });
});
