import { Component, Prop, h, Event, EventEmitter, Element, Watch } from '@stencil/core';
import { v4 } from 'uuid';
import IMask, { InputMask } from 'imask';
@Component({
  tag: 'ir-input',
  styleUrl: 'ir-input.css',
  scoped: true,
})
export class IrInput {
  @Element() el: HTMLIrInputElement;
  @Prop() inputId: string = v4();
  @Prop({ reflect: true }) leftIcon: boolean = false;
  @Prop({ reflect: true }) rightIcon: boolean = false;
  @Prop() inputStyles: Partial<CSSStyleDeclaration>;
  @Prop() value: string;
  @Prop() type:
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week' = 'text';
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
  @Prop() label: string;
  @Prop() error: boolean = false;
  @Prop() mask: Record<string, unknown>;
  @Prop() labelBackground: string;
  @Prop() mode: 'double-line' | 'default' = 'double-line';
  @Prop() tooltip: string;

  @Event({ bubbles: true, composed: true }) textChanged: EventEmitter<string>;
  @Event({ bubbles: true, composed: true }) inputFocus: EventEmitter<FocusEvent>;
  @Event({ bubbles: true, composed: true }) inputBlur: EventEmitter<FocusEvent>;

  private inputEl: HTMLDivElement;
  private maskInstance: InputMask<any>;
  input: HTMLInputElement;

  applyStyles(style: Partial<CSSStyleDeclaration>) {
    for (const property in style) {
      if (style.hasOwnProperty(property)) {
        this.inputEl.style[property] = style[property];
      }
    }
  }
  private initializeOrUpdateMask() {
    const input = this.el.querySelector('input') as HTMLInputElement;
    if (this.mask) {
      if (this.maskInstance) {
        this.maskInstance.updateOptions(this.mask);
        if (this.value) this.maskInstance.updateValue();
      } else {
        this.maskInstance = IMask(input, this.mask);
        this.maskInstance.on('accept', () => {
          this.textChanged.emit(this.maskInstance.value);
        });
      }
    }
  }

  componentDidLoad() {
    if (this.inputStyles) {
      this.applyStyles(this.inputStyles);
    }
    if (this.mask) {
      this.initializeOrUpdateMask();
      this.input = this.el.querySelector(`input`) as HTMLInputElement;
      const mask = IMask(this.input, this.mask);
      mask.on('accept', () => {
        this.textChanged.emit(mask.value);
      });
      mask.updateValue();
    }
  }
  @Watch('mask')
  maskPropChanged(newValue: Record<string, unknown>, oldValue: Record<string, unknown>) {
    if (newValue !== oldValue) {
      if (this.maskInstance) {
        this.maskInstance.destroy();
      }
      this.initializeOrUpdateMask();
    }
  }

  @Watch('value')
  valueChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      if (this.maskInstance && newValue !== '') {
        this.maskInstance.value = newValue;
        this.maskInstance.updateValue();
      }
    }
  }
  @Watch('error')
  onErrorChange(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue) {
      if (newValue) {
        this.el.setAttribute('data-state', 'error');
      } else {
        if (this.el.hasAttribute('data-state')) {
          this.el.removeAttribute('data-state');
        }
      }
    }
  }

  handleBlur(event: FocusEvent) {
    this.inputEl.classList.remove('focused');
    if ((event.target as HTMLInputElement).value) {
      this.inputEl.classList.add('has-value');
    } else {
      this.inputEl.classList.remove('has-value');
    }
    this.inputBlur.emit(event);
  }

  disconnectedCallback() {
    if (this.maskInstance) {
      this.maskInstance.destroy();
    }
  }

  render() {
    return (
      <div ref={el => (this.inputEl = el)} class={`input-container  ${this.disabled ? 'disabled' : ''}`} data-context={this.leftIcon ? 'icon' : ''}>
        {this.leftIcon && (
          <label htmlFor={this.inputId} class="left-icon">
            <slot name="left-icon"></slot>
          </label>
        )}
        <input
          type={this.type}
          name={this.name}
          placeholder={this.placeholder}
          id={this.inputId}
          class={this.class}
          required={this.required}
          disabled={this.disabled}
          readonly={this.readonly}
          maxlength={this.maxlength}
          min={this.min}
          max={this.max}
          step={this.step}
          pattern={this.pattern}
          autocomplete={this.autocomplete}
          autofocus={this.autofocus}
          size={this.size}
          multiple={this.multiple}
          value={this.value}
          onInput={e => this.textChanged.emit((e.target as HTMLInputElement).value)}
          onBlur={this.handleBlur.bind(this)}
          onFocus={e => this.inputFocus.emit(e)}
        />

        <p slot="tooltip-trigger" title={this.tooltip} class="placeholder" style={{ '--label-background': this.labelBackground }}>
          {this.label}
        </p>
        {this.rightIcon && (
          <label htmlFor={this.inputId} class="right-icon">
            <slot name="right-icon"></slot>
          </label>
        )}
      </div>
    );
  }
}
