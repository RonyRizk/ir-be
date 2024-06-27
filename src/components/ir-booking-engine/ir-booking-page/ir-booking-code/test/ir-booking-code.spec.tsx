import { newSpecPage } from '@stencil/core/testing';
import { IrBookingCode } from '../ir-booking-code';

describe('ir-booking-code', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingCode],
      html: `<ir-booking-code></ir-booking-code>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-code>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-code>
    `);
  });
});
