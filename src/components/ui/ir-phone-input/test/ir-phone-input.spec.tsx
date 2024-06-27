import { newSpecPage } from '@stencil/core/testing';
import { IrPhoneInput } from '../ir-phone-input';

describe('ir-phone-input', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPhoneInput],
      html: `<ir-phone-input></ir-phone-input>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-phone-input>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-phone-input>
    `);
  });
});
