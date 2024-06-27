import { newSpecPage } from '@stencil/core/testing';
import { IrBookingHeader } from '../ir-booking-header';

describe('ir-booking-header', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingHeader],
      html: `<ir-booking-header></ir-booking-header>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-header>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-header>
    `);
  });
});
