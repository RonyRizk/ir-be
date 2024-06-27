import { Component, Host, Prop, State, h, Event, EventEmitter, Watch } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-checkbox',
  styleUrl: 'ir-checkbox.css',
  shadow: true,
})
export class IrCheckbox {
  @Prop() checked: boolean = false;
  @Prop() label: string;
  @Prop() checkboxId = v4();
  @Prop() name: string;
  @Prop() disabled: boolean;

  @State() currentChecked = false;

  @Event() checkChange: EventEmitter<boolean>;

  @Watch('checked')
  handleCheckedChange(newValue: boolean) {
    if (newValue === this.currentChecked) {
      return;
    }
    this.currentChecked = this.checked;
  }

  private checkboxRef: HTMLButtonElement;

  componentWillLoad() {
    this.currentChecked = this.checked;
  }
  componentDidLoad() {
    if (this.checkboxRef) {
      this.checkboxRef.setAttribute('aria-checked', JSON.stringify(this.checked));
    }
  }
  handleCheckChange() {
    this.currentChecked = !this.currentChecked;
    if (this.checkboxRef) {
      this.checkboxRef.setAttribute('aria-checked', JSON.stringify(this.currentChecked));
    }
    this.checkChange.emit(this.currentChecked);
  }
  render() {
    return (
      <Host>
        <button
          disabled={this.disabled}
          name={this.name}
          onClick={this.handleCheckChange.bind(this)}
          id={this.checkboxId}
          data-state={this.currentChecked ? 'checked' : 'unchecked'}
          value={'on'}
          ref={ref => (this.checkboxRef = ref)}
          type="button"
          role="checkbox"
          class="CheckboxRoot"
        >
          {this.currentChecked && (
            <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
              <path
                fill="currentColor"
                d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
              />
            </svg>
          )}
        </button>
        <input type="checkbox" aria-hidden="true" tabindex="-1" value="on" checked={this.currentChecked} class="checkbox" />
        {this.label && (
          <label htmlFor={this.checkboxId} class="checkbox-label">
            {this.label}
          </label>
        )}
      </Host>
    );
  }
}
