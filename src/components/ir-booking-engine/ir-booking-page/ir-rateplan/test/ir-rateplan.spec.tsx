import { newSpecPage } from '@stencil/core/testing';
import { IrRateplan } from '../ir-rateplan';

describe('ir-rateplan', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRateplan],
      html: `<ir-rateplan></ir-rateplan>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-rateplan>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-rateplan>
    `);
  });
});
