import { newSpecPage } from '@stencil/core/testing';
import { IrCreditCardInput } from '../ir-credit-card-input';

describe('ir-credit-card-input', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCreditCardInput],
      html: `<ir-credit-card-input></ir-credit-card-input>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-credit-card-input>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-credit-card-input>
    `);
  });
});
