import { addOverlay, removeOverlay } from '@/stores/overlay.store';
import { Component, Host, h, Element, Listen, State, Method } from '@stencil/core';

@Component({
  tag: 'ir-alert-dialog',
  styleUrl: 'ir-alert-dialog.css',
  shadow: true,
})
export class IrAlertDialog {
  @Element() el: HTMLElement;
  private firstFocusableElement: HTMLElement;
  private lastFocusableElement: HTMLElement;

  @State() isOpen = false;

  componentDidLoad() {
    this.prepareFocusTrap();
  }

  @Method()
  async openModal() {
    this.isOpen = true;
    this.prepareFocusTrap();
  }

  @Method()
  async closeModal() {
    removeOverlay();
    this.isOpen = false;
  }

  prepareFocusTrap() {
    addOverlay();
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableContent: NodeListOf<HTMLElement> = this.el.querySelectorAll(focusableElements);
    if (focusableContent.length === 0) return;

    this.firstFocusableElement = focusableContent[0];
    this.lastFocusableElement = focusableContent[focusableContent.length - 1];
    this.firstFocusableElement.focus();
  }

  @Listen('keydown', { target: 'document' })
  handleKeyDown(ev: KeyboardEvent) {
    let isTabPressed = ev.key === 'Tab' || ev.keyCode === 9;

    if (!isTabPressed) return;

    if (ev.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        this.lastFocusableElement.focus();
        ev.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        this.firstFocusableElement.focus();
        ev.preventDefault();
      }
    }
  }

  disconnectedCallback() {
    removeOverlay();
  }

  render() {
    return (
      <Host>
        <div class="backdrop" data-state={this.isOpen ? 'opened' : 'closed'}></div>
        {this.isOpen && (
          <div class="modal-container" tabIndex={-1} role="alertdialog" aria-labelledby="dialog1Title" aria-describedby="dialog1Desc">
            <div class={'modal-title'} id="dialog1Title">
              <slot name="modal-title"></slot>
            </div>
            <div class="modal-body" id="dialog1Desc">
              <slot name="modal-body"></slot>
            </div>
            <div class="modal-footer">
              <slot name="modal-footer"></slot>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
