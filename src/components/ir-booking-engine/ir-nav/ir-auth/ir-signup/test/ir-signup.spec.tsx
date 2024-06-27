import { newSpecPage } from '@stencil/core/testing';
import { IrSignup } from '../ir-signup';

describe('ir-signup', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSignup],
      html: `<ir-signup></ir-signup>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-signup>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-signup>
    `);
  });
});
