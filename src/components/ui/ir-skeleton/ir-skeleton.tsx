import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-skeleton',
  styleUrl: 'ir-skeleton.css',
  shadow: true,
})
export class IrSkeleton {
  @Prop() customClasses: string;
  @Prop() styles: {
    [className: string]: boolean;
  };

  render() {
    return <div class={{ 'animate block': true, [this.customClasses]: true, ...this.styles }}></div>;
  }
}
