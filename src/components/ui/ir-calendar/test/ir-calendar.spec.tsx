import { newSpecPage } from '@stencil/core/testing';
import { IrCalendar } from '../ir-calendar';

describe('ir-calendar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrCalendar],
      html: `<ir-calendar></ir-calendar>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-calendar>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-calendar>
    `);
  });
});
