import { Component, Host, h, Prop, Element, Method } from '@stencil/core';
import { createPopper, Instance as PopperInstance } from '@popperjs/core';

const DEFAULT_OFFSET = 20;
const Z_INDEX = '9005';
const ID_PORTAL = 'ir-portal';

@Component({
  tag: 'ir-portal',
  styleUrl: 'ir-portal.css',
  shadow: true,
})
export class IrPortal {
  @Prop() reference: HTMLElement;
  @Prop() offset: number = DEFAULT_OFFSET;

  @Element() hostElement: HTMLElement;

  private portal: HTMLElement;
  private popperInstance: PopperInstance;

  componentDidLoad() {
    this.createPortal();
    this.moveElementToPortal();
    this.initializePopper();
  }

  disconnectedCallback() {
    if (this.popperInstance) {
      this.popperInstance.destroy();
    }
    if (this.portal) {
      this.portal.remove();
    }
  }

  private createPortal() {
    this.portal = document.createElement('div');
    this.portal.setAttribute('id', ID_PORTAL);
    this.portal.style.zIndex = Z_INDEX;
    this.portal.style.position = 'fixed';
    document.body.append(this.portal);
  }

  private moveElementToPortal() {
    while (this.hostElement.childNodes.length > 0) {
      this.portal.appendChild(this.hostElement.firstChild);
    }
  }

  @Method()
  async updatePosition() {
    if (this.popperInstance) {
      this.popperInstance.update();
    }
  }

  private initializePopper() {
    this.popperInstance = createPopper(this.reference, this.portal, {
      placement: 'auto-start',
      strategy: 'fixed',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, this.offset],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: 'viewport',
          },
        },
      ],
    });
  }

  render() {
    return (
      <Host>
        <slot name="portal-body" />
      </Host>
    );
  }
}
