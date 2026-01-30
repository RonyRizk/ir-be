import { Component, Prop, h } from '@stencil/core';
import icons, { TIcons } from './icons';
import { cn } from '@/utils/utils';

@Component({
  tag: 'ir-icons',
  styleUrl: 'ir-icons.css',
  shadow: false,
})
export class IrIcons {
  @Prop() name: TIcons;
  @Prop() svgClassName: string;
  @Prop() height: number;
  @Prop() width: number;
  @Prop() removeClassName: boolean;
  render() {
    const svgPath = icons[this.name] || null;
    if (!svgPath) {
      return null;
    }
    return (
      <svg
        part="icon"
        height={this.height}
        width={this.width}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={svgPath.viewBox}
        class={this.removeClassName ? '' : cn('h-5 w-5', this.svgClassName)}
      >
        <path fill="currentColor" d={svgPath.d}></path>
      </svg>
    );
  }
}
