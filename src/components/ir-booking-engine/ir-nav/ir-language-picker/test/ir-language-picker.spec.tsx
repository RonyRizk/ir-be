import { newSpecPage } from '@stencil/core/testing';
import { IrLanguagePicker } from '../ir-language-picker';

describe('ir-language-picker', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrLanguagePicker],
      html: `<ir-language-picker></ir-language-picker>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-language-picker>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-language-picker>
    `);
  });
});
