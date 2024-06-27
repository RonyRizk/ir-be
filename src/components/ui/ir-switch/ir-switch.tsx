import { Component, Host, Prop, h, Event, EventEmitter } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-switch',
  styleUrl: 'ir-switch.css',
  shadow: true,
})
export class IrSwitch {
  @Prop({ mutable: true }) checked = false;
  @Prop() switchId: string;
  @Prop() disabled: boolean = false;

  @Event() checkChange: EventEmitter<boolean>;

  private switchRoot: HTMLButtonElement;
  private _id = v4();

  componentDidLoad() {
    if (!this.switchRoot) {
      return;
    }
    this.switchRoot.setAttribute('aria-checked', this.checked ? 'true' : 'false');
  }

  handleCheckChange() {
    this.checked = !this.checked;
    this.switchRoot.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    this.checkChange.emit(this.checked);
  }

  render() {
    return (
      <Host>
        <button
          disabled={this.disabled}
          ref={el => (this.switchRoot = el)}
          type="button"
          id={this.switchId || this._id}
          onClick={this.handleCheckChange.bind(this)}
          role="switch"
          data-state={this.checked ? 'checked' : 'unchecked'}
          value={'on'}
          class="SwitchRoot"
        >
          <span class="SwitchThumb" data-state={this.checked ? 'checked' : 'unchecked'}></span>
        </button>
        <input type="checkbox" checked={this.checked} aria-hidden="true" tabIndex={-1} value={'on'} class="hidden-input" />
      </Host>
    );
  }
}
