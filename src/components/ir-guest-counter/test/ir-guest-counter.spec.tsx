import { newSpecPage } from '@stencil/core/testing';
import { IrGuestCounter } from '../ir-guest-counter';

describe('ir-guest-counter', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrGuestCounter],
      html: `<ir-guest-counter></ir-guest-counter>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-guest-counter>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-guest-counter>
    `);
  });
});
