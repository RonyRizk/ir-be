import { newSpecPage } from '@stencil/core/testing';
import { IrTextarea } from '../ir-textarea';

describe('ir-textarea', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrTextarea],
      html: `<ir-textarea></ir-textarea>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-textarea>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-textarea>
    `);
  });
});
