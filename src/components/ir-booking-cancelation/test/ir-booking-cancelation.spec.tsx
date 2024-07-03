import { newSpecPage } from '@stencil/core/testing';
import { IrBookingCancelation } from '../ir-booking-cancelation';

describe('ir-booking-cancelation', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingCancelation],
      html: `<ir-booking-cancelation></ir-booking-cancelation>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-cancelation>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-cancelation>
    `);
  });
});
