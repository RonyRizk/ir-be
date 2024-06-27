import { newSpecPage } from '@stencil/core/testing';
import { IrSelect } from '../ir-select';

describe('ir-select', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSelect],
      html: `<ir-select></ir-select>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-select>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-select>
    `);
  });
});
