import { newSpecPage } from '@stencil/core/testing';
import { IrHomeLoader } from '../ir-home-loader';

describe('ir-home-loader', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrHomeLoader],
      html: `<ir-home-loader></ir-home-loader>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-home-loader>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-home-loader>
    `);
  });
});
