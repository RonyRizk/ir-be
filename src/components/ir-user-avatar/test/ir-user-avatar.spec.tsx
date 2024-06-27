import { newSpecPage } from '@stencil/core/testing';
import { IrUserAvatar } from '../ir-user-avatar';

describe('ir-user-avatar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrUserAvatar],
      html: `<ir-user-avatar></ir-user-avatar>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-user-avatar>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-user-avatar>
    `);
  });
});
