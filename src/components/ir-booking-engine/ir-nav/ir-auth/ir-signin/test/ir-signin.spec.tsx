import { newSpecPage } from '@stencil/core/testing';
import { IrSignin } from '../ir-signin';

describe('ir-signin', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSignin],
      html: `<ir-signin></ir-signin>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-signin>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-signin>
    `);
  });
});
