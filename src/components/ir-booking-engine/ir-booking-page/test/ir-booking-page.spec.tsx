import { newSpecPage } from '@stencil/core/testing';
import { IrBookingPage } from '../ir-booking-page';

describe('ir-booking-page', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrBookingPage],
      html: `<ir-booking-page></ir-booking-page>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-booking-page>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-booking-page>
    `);
  });
});
