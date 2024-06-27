import { newSpecPage } from '@stencil/core/testing';
import { IrBookingWidget } from '../ir-booking-widget';

describe('ir-booking-widget', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingWidget],
      html: `<ir-booking-widget></ir-booking-widget>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-widget>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-widget>
    `);
  });
});
