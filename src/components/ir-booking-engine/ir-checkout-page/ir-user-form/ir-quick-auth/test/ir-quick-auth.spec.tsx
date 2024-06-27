import { newSpecPage } from '@stencil/core/testing';
import { IrQuickAuth } from '../ir-quick-auth';

describe('ir-quick-auth', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrQuickAuth],
      html: `<ir-quick-auth></ir-quick-auth>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-quick-auth>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-quick-auth>
    `);
  });
});
