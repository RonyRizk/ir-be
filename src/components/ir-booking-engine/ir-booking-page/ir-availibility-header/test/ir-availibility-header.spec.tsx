import { newSpecPage } from '@stencil/core/testing';
import { IrAvailibilityHeader } from '../ir-availibility-header';

describe('ir-availibility-header', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrAvailibilityHeader],
      html: `<ir-availibility-header></ir-availibility-header>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-availibility-header>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-availibility-header>
    `);
  });
});
