import { newSpecPage } from '@stencil/core/testing';
import { IrInput } from '../ir-input';

describe('ir-input', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrInput],
      html: `<ir-input></ir-input>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-input>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-input>
    `);
  });
});
