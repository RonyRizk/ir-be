import { newSpecPage } from '@stencil/core/testing';
import { IrCheckbox } from '../ir-checkbox';

describe('ir-checkbox', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCheckbox],
      html: `<ir-checkbox></ir-checkbox>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-checkbox>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-checkbox>
    `);
  });
});
