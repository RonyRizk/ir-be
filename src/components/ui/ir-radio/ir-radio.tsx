import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-radio',
  styleUrl: 'ir-radio.css',
  shadow: false,
})
export class IrRadio {
  @Prop({ reflect: true }) checked: boolean = false;
  @Prop() radioId = v4();

  @Event() checkChange: EventEmitter<boolean>;

  render() {
    return (
      <button
        role="radio"
        class="radio-button"
        onClick={() => {
          this.checkChange.emit(!this.checked);
        }}
        id={this.radioId}
        data-state={this.checked ? 'checked' : 'unchecked'}
        aria-checked={this.checked ? 'true' : 'false'}
      >
        <div class="thumb" data-state={this.checked ? 'checked' : 'unchecked'}></div>
        <input type="radio" aria-hidden="true" tabindex="-1" checked={this.checked} class={'radio-input'} />
      </button>
    );
  }
}
