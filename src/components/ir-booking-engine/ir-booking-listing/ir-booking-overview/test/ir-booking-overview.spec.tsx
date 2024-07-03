import { newSpecPage } from '@stencil/core/testing';
import { IrBookingOverview } from '../ir-booking-overview';

describe('ir-booking-overview', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingOverview],
      html: `<ir-booking-overview></ir-booking-overview>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-overview>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-overview>
    `);
  });
});
