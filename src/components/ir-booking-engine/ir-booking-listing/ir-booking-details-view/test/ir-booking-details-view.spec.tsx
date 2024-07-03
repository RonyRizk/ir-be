import { newSpecPage } from '@stencil/core/testing';
import { IrBookingDetailsView } from '../ir-booking-details-view';

describe('ir-booking-details-view', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingDetailsView],
      html: `<ir-booking-details-view></ir-booking-details-view>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-details-view>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-details-view>
    `);
  });
});
