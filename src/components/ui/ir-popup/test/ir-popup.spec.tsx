import { newSpecPage } from '@stencil/core/testing';
import { IrPopup } from '../ir-popup';

describe('ir-popup', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPopup],
      html: `<ir-popup></ir-popup>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-popup>
        <mock:shadow-root>
          <slot name="anchor"></slot>
          <dialog class="dialog">
            <div class="popup-content">
              <div class="body">
                <slot name="body"></slot>
              </div>
            </div>
          </dialog>
        </mock:shadow-root>
      </ir-popup>
    `);
  });
});
