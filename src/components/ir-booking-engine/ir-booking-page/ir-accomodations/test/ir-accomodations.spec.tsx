import { newSpecPage } from '@stencil/core/testing';
import { IrAccomodations } from '../ir-accomodations';

describe('ir-accomodations', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrAccomodations],
      html: `<ir-accomodations></ir-accomodations>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-accomodations>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-accomodations>
    `);
  });
});
