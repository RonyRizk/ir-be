import { newSpecPage } from '@stencil/core/testing';
import { IrRoomTypeAmenities } from '../ir-room-type-amenities';

describe('ir-room-type-amenities', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrRoomTypeAmenities],
      html: `<ir-room-type-amenities></ir-room-type-amenities>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-room-type-amenities>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-room-type-amenities>
    `);
  });
});
