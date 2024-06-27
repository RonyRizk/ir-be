import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-textarea',
  styleUrl: 'ir-textarea.css',
  shadow: true,
})
export class IrTextarea {
  @Prop() inputId: string = v4();
  @Prop({ reflect: true }) leftIcon: boolean = false;
  @Prop() value: string;
  @Prop({ reflect: true }) name: string;
  @Prop({ reflect: true }) placeholder: string;
  @Prop({ reflect: true }) inputid: string;
  @Prop({ reflect: true }) class: string;
  @Prop({ reflect: true }) required: boolean;
  @Prop({ reflect: true }) disabled: boolean;
  @Prop({ reflect: true }) readonly: boolean;
  @Prop({ reflect: true }) maxlength: number;
  @Prop({ reflect: true }) min: string | number;
  @Prop({ reflect: true }) max: string | number;
  @Prop({ reflect: true }) step: string | number;
  @Prop({ reflect: true }) pattern: string;
  @Prop({ reflect: true }) autocomplete: string;
  @Prop({ reflect: true }) autofocus: boolean;
  @Prop({ reflect: true }) size: number;
  @Prop({ reflect: true }) multiple: boolean;
  @Prop() error: boolean = false;
  @Prop() label: string;
  @Event({ bubbles: true, composed: true }) textChanged: EventEmitter<string>;
  @Event({ bubbles: true, composed: true }) inputFocus: EventEmitter<FocusEvent>;
  @Event({ bubbles: true, composed: true }) inputBlur: EventEmitter<FocusEvent>;
  render() {
    return (
      <div class={`textarea-container ${this.value ? 'has-value' : ''}`}>
        <textarea
          name={this.name}
          autoFocus={this.autofocus}
          disabled={this.disabled}
          value={this.value}
          class={this.error ? 'error' : ''}
          id={this.inputId}
          maxLength={this.maxlength}
          onFocus={e => this.inputFocus.emit(e)}
          onBlur={e => this.inputBlur.emit(e)}
          onInput={e => this.textChanged.emit((e.target as HTMLTextAreaElement).value)}
        ></textarea>
        <label htmlFor={this.inputid}>{this.label}</label>
      </div>
    );
  }
}
