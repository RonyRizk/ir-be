import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-badge',
  styleUrl: 'ir-badge.css',
  shadow: true,
})
export class IrBadge {
  @Prop() label: string;
  @Prop() variant: 'default' | 'error' | 'pending' | 'success' = 'default';
  @Prop() size: 'sm' | 'md' | 'lg' = 'sm';
  @Prop() withDot: '';
  @Prop() backgroundShown = true;

  render() {
    return <p class={`size-${this.size} badge ${this.variant} ${this.backgroundShown ? '' : 'transparent'}`}>{this.label}</p>;
  }
}
