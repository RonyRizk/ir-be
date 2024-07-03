import { newSpecPage } from '@stencil/core/testing';
import { IrUserProfile } from '../ir-user-profile';

describe('ir-user-profile', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrUserProfile],
      html: `<ir-user-profile></ir-user-profile>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-user-profile>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-user-profile>
    `);
  });
});
