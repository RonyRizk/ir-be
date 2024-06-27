import { newSpecPage } from '@stencil/core/testing';
import { IrPrivacyPolicy } from '../ir-privacy-policy';

describe('ir-privacy-policy', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrPrivacyPolicy],
      html: `<ir-privacy-policy></ir-privacy-policy>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-privacy-policy>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-privacy-policy>
    `);
  });
});
