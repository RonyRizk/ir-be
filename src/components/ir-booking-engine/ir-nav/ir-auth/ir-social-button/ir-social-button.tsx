import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

@Component({
  tag: 'ir-social-button',
  styleUrl: 'ir-social-button.css',
  shadow: false,
})
export class IrSocialButton {
  @Prop() label: string;
  @Event() socialButtonClick: EventEmitter<MouseEvent>;
  render() {
    return (
      <button class="social-button" type="button" onClick={e => this.socialButtonClick.emit(e)}>
        <div class="icon">
          <slot name="icon"></slot>
        </div>
        <span>{this.label}</span>
      </button>
    );
  }
}
