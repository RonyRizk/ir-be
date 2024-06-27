import { newSpecPage } from '@stencil/core/testing';
import { IrUserForm } from '../ir-user-form';

describe('ir-user-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrUserForm],
      html: `<ir-user-form></ir-user-form>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-user-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-user-form>
    `);
  });
});
