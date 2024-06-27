import { newSpecPage } from '@stencil/core/testing';
import { IrSeoInjector } from '../ir-seo-injector';

describe('ir-seo-injector', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrSeoInjector],
      html: `<ir-seo-injector></ir-seo-injector>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-seo-injector>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-seo-injector>
    `);
  });
});
