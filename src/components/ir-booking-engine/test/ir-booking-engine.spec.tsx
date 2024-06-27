import { newSpecPage } from '@stencil/core/testing';
import { IrBookingEngine } from '../ir-booking-engine';

describe('ir-booking-engine', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingEngine],
      html: `<ir-booking-engine></ir-booking-engine>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-engine>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-engine>
    `);
  });
});
