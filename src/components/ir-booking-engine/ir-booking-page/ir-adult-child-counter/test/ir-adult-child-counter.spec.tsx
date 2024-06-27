import { newSpecPage } from '@stencil/core/testing';
import { IrAdultChildCounter } from '../ir-adult-child-counter';

describe('ir-adult-child-counter', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [IrAdultChildCounter],
      html: `<ir-adult-child-counter></ir-adult-child-counter>`,
    });
    expect(page.root).toEqualHtml(`
      <ir-adult-child-counter>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ir-adult-child-counter>
    `);
  });
});
