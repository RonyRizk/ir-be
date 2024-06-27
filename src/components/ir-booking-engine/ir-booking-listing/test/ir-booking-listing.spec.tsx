import { newSpecPage } from '@stencil/core/testing';
import { IrBookingListing } from '../ir-booking-listing';

describe('ir-booking-listing', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingListing],
      html: `<ir-booking-listing></ir-booking-listing>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-listing>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-listing>
    `);
  });
});
