import { newSpecPage } from '@stencil/core/testing';
import { IrAuth } from '../ir-auth';

describe('ir-auth', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrAuth],
      html: `<ir-auth></ir-auth>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-auth>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-auth>
    `);
  });
});
