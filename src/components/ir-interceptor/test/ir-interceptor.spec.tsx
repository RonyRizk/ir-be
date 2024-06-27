import { newSpecPage } from '@stencil/core/testing';
import { IrInterceptor } from '../ir-interceptor';

describe('ir-interceptor', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrInterceptor],
      html: `<ir-interceptor></ir-interceptor>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-interceptor>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-interceptor>
    `);
  });
});
