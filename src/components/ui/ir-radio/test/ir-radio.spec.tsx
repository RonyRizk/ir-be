import { newSpecPage } from '@stencil/core/testing';
import { IrRadio } from '../ir-radio';

describe('ir-radio', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRadio],
      html: `<ir-radio></ir-radio>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-radio>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-radio>
    `);
  });
});
