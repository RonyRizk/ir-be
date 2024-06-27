import { newSpecPage } from '@stencil/core/testing';
import { IrBookingSummary } from '../ir-booking-summary';

describe('ir-booking-summary', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingSummary],
      html: `<ir-booking-summary></ir-booking-summary>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-summary>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-summary>
    `);
  });
});
