import { newSpecPage } from '@stencil/core/testing';
import { IrSocialButton } from '../ir-social-button';

describe('ir-social-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSocialButton],
      html: `<ir-social-button></ir-social-button>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-social-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-social-button>
    `);
  });
});
