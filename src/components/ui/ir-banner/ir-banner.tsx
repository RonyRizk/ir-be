import { Component, h } from '@stencil/core';

@Component({
  tag: 'ir-banner',
  styleUrl: 'ir-banner.css',
  shadow: true,
})
export class IrBanner {
  render() {
    return <div class="banner"></div>;
  }
}
