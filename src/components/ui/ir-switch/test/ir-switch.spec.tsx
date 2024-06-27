import { newSpecPage } from '@stencil/core/testing';
import { IrSwitch } from '../ir-switch';

describe('ir-switch', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSwitch],
      html: `<ir-switch></ir-switch>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-switch>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-switch>
    `);
  });
});
