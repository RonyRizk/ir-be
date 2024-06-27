import { newSpecPage } from '@stencil/core/testing';
import { IrBookingCard } from '../ir-booking-card';

describe('ir-booking-card', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingCard],
      html: `<ir-booking-card></ir-booking-card>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-card>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-card>
    `);
  });
});
