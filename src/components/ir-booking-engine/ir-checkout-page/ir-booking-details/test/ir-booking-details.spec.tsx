import { newSpecPage } from '@stencil/core/testing';
import { IrBookingDetails } from '../ir-booking-details';

describe('ir-booking-details', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingDetails],
      html: `<ir-booking-details></ir-booking-details>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-details>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-details>
    `);
  });
});
