import { newSpecPage } from '@stencil/core/testing';
import { IrButton } from '../ir-button';

describe('ir-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrButton],
      html: `<ir-button></ir-button>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-button>
    `);
  });
});
