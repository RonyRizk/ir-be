import { cn } from '@/utils/utils';
import { Component, Event, EventEmitter, Prop, Watch, h } from '@stencil/core';
import { v4 } from 'uuid';
import { TIcons } from '../ir-icons/icons';

@Component({
  tag: 'ir-button',
  styleUrl: 'ir-button.css',
  scoped: true,
})
export class IrButton {
  @Prop() size: 'sm' | 'md' | 'lg' | 'pill' = 'sm';
  @Prop() disabled: boolean;
  @Prop() label: string;
  @Prop() name: string = '';
  @Prop() buttonId: string = v4();
  @Prop() type: 'button' | 'submit' | 'reset' | 'menu' = 'button';
  @Prop() haveLeftIcon = false;
  @Prop() variants: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link' | 'icon' | 'ghost-primary' | 'outline-primary' | 'icon-primary' = 'default';
  @Prop() isLoading = false;
  @Prop() buttonStyles: Partial<CSSStyleDeclaration>;
  @Prop() buttonClassName: string;
  @Prop() haveRightIcon: boolean;
  @Prop() iconName: TIcons;
  @Prop() svgClassName: string;
  @Prop() removeIconClassName: boolean;
  @Prop() iconHeight: number;
  @Prop() iconWidth: number;

  @Event() buttonClick: EventEmitter<MouseEvent>;

  private buttonRef: HTMLButtonElement;

  applyStyles(style: Partial<CSSStyleDeclaration>) {
    for (const property in style) {
      if (style.hasOwnProperty(property)) {
        this.buttonRef.style[property] = style[property];
      }
    }
  }
  @Watch('buttonStyles')
  handleButtonStylesChange(newValue: Partial<CSSStyleDeclaration>) {
    this.applyStyles(newValue);
  }

  componentDidLoad() {
    if (this.buttonStyles) {
      this.applyStyles(this.buttonStyles);
    }
  }

  render() {
    if (['icon', 'icon-primary'].includes(this.variants)) {
      return (
        <button
          ref={el => (this.buttonRef = el)}
          onClick={e => this.buttonClick.emit(e)}
          id={this.buttonId}
          class={cn(`button-${this.variants}`, 'flex items-center justify-center', this.isLoading ? 'is-loading' : '', this.buttonClassName)}
          data-size={this.size}
          disabled={this.disabled}
        >
          {this.isLoading ? (
            <span class="loader"></span>
          ) : (
            <div>
              <ir-icons height={this.iconHeight} width={this.iconWidth} removeClassName={this.removeIconClassName} name={this.iconName} svgClassName={this.svgClassName}></ir-icons>
            </div>
          )}
        </button>
      );
    }
    return (
      <button
        ref={el => (this.buttonRef = el)}
        onClick={e => this.buttonClick.emit(e)}
        id={this.buttonId}
        class={cn(`button-${this.variants} flex items-center justify-center`, this.buttonClassName)}
        data-size={this.size}
        disabled={this.disabled}
        type={this.type}
      >
        {this.haveLeftIcon && !this.isLoading && (
          <div>
            <slot name="left-icon"></slot>
          </div>
        )}
        {this.isLoading && !['link', 'ghost'].includes(this.variants) && <span class="loader"></span>}
        {this.label}
        {this.haveRightIcon && !this.isLoading && (
          <div>
            <slot name="right-icon"></slot>
          </div>
        )}
      </button>
    );
  }
}
