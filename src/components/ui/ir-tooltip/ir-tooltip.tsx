import { createPopper } from '@popperjs/core';
import { Component, Fragment, Host, Prop, State, h, Element, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'ir-tooltip',
  styleUrl: 'ir-tooltip.css',
  shadow: true,
})
export class IrTooltip {
  @Element() el: HTMLElement;

  @Prop({ reflect: true }) message: string;
  @Prop() withHtml: boolean = true;
  @Prop() label: string;
  @Prop() labelColors: 'default' | 'green' | 'red' = 'default';
  @Prop() open_behavior: 'hover' | 'click' = 'hover';

  @State() open: boolean;

  @Event() tooltipOpenChange: EventEmitter<boolean>;

  private popperInstance: any;
  private tooltipTimeout: NodeJS.Timeout;
  private trigger: HTMLButtonElement;
  private content: HTMLDivElement;

  componentDidLoad() {
    this.createPopperInstance();
  }
  handleOutsideClick = (event: MouseEvent) => {
    const outsideClick = typeof event.composedPath === 'function' && !event.composedPath().includes(this.el);
    if (outsideClick && this.open) {
      this.open = false;
    }
  };
  createPopperInstance() {
    if (this.trigger && this.content) {
      this.popperInstance = createPopper(this.trigger, this.content, {
        placement: 'auto',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      });
    }
  }

  toggleOpen(shouldOpen: boolean) {
    if (shouldOpen) {
      document.addEventListener('click', this.handleOutsideClick, true);
    } else {
      document.removeEventListener('click', this.handleOutsideClick, true);
    }
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }

    if (shouldOpen) {
      this.tooltipTimeout = setTimeout(() => {
        this.open = true;
        if (this.popperInstance) {
          this.popperInstance.update();
        } else {
          this.createPopperInstance();
        }
      }, 300);
    } else {
      this.open = false;
      if (this.popperInstance) {
        this.popperInstance.destroy();
        this.popperInstance = null;
      }
    }
    this.tooltipOpenChange.emit(shouldOpen);
  }

  disconnectedCallback() {
    if (this.popperInstance) {
      this.popperInstance.destroy();
    }
    document.removeEventListener('click', this.handleOutsideClick, true);
  }
  render() {
    return (
      <Host>
        <button
          ref={el => (this.trigger = el)}
          onMouseEnter={() => {
            if (this.open_behavior === 'hover') {
              this.toggleOpen(true);
            }
          }}
          onMouseLeave={() => {
            if (this.open_behavior === 'hover') this.toggleOpen(false);
          }}
          onClick={() => {
            if (this.open_behavior === 'click') {
              this.toggleOpen(!this.open);
            }
          }}
        >
          <slot name="tooltip-trigger">
            <div class="tooltip-container">
              <p class={`tooltip-label label-${this.labelColors}`}>{this.label}</p>
              <svg data-toggle="tooltip" data-placement="top" xmlns="http://www.w3.org/2000/svg" height="16" width="16" class="tooltip-icon" viewBox="0 0 512 512">
                <path
                  fill={'currentColor'}
                  d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
                />
              </svg>
            </div>
          </slot>
        </button>
        <div ref={el => (this.content = el)} class="z-50" role="tooltip">
          {this.open && (
            <Fragment>
              <div
                class="tooltip-content max-w-xs rounded-lg
              px-3 py-2 text-xs "
              >
                <div innerHTML={this.message}></div>
              </div>
            </Fragment>
          )}
        </div>
      </Host>
    );
  }
}
