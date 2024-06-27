import localizedWords from '@/stores/localization.store';
import { addOverlay, removeOverlay } from '@/stores/overlay.store';
import { Component, Host, h, Element, Method, Listen, State, Event, EventEmitter, Prop } from '@stencil/core';

@Component({
  tag: 'ir-dialog',
  styleUrl: 'ir-dialog.css',
  shadow: true,
})
export class IrDialog {
  @Prop() closeButton: boolean = true;
  @Element() el: HTMLElement;
  private firstFocusableElement: HTMLElement;
  private lastFocusableElement: HTMLElement;

  @State() isOpen = false;
  @Event() openChange: EventEmitter<boolean>;

  componentDidLoad() {
    this.prepareFocusTrap();
  }

  @Method()
  async openModal() {
    this.isOpen = true;
    addOverlay();
    setTimeout(() => {
      this.prepareFocusTrap();
    }, 10);
    this.openChange.emit(this.isOpen);
  }

  @Method()
  async closeModal() {
    if (!this.isOpen) {
      return;
    }
    removeOverlay();
    this.isOpen = false;
    this.openChange.emit(this.isOpen);
  }

  prepareFocusTrap() {
    const focusableElements = 'button,ir-dropdown ,[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableContent: NodeListOf<HTMLElement> = this.el.shadowRoot.querySelectorAll(focusableElements);
    // console.log(focusableContent);
    if (focusableContent.length === 0) return;
    this.firstFocusableElement = focusableContent[0];
    this.lastFocusableElement = focusableContent[focusableContent.length - 1];
    this.firstFocusableElement.focus();
  }

  @Listen('keydown', { target: 'window' })
  handleKeyDown(ev: KeyboardEvent) {
    if (!this.isOpen) {
      return;
    }

    let isTabPressed = ev.key === 'Tab';
    if (ev.key === 'Escape' && this.isOpen) {
      this.closeModal();
    }
    if (!isTabPressed) {
      return;
    }

    // If focus is about to leave the last focusable element, redirect it to the first.
    if (!ev.shiftKey && document.activeElement === this.lastFocusableElement) {
      this.firstFocusableElement.focus();
      ev.preventDefault();
    }

    // If focus is about to leave the first focusable element, redirect it to the last.
    if (ev.shiftKey && document.activeElement === this.firstFocusableElement) {
      this.lastFocusableElement.focus();
      ev.preventDefault();
    }
  }

  disconnectedCallback() {
    removeOverlay();
  }

  render() {
    return (
      <Host>
        <div class="backdrop" data-state={this.isOpen ? 'opened' : 'closed'} onClick={() => this.closeModal()}></div>
        {this.isOpen && (
          <div class="modal-container" tabIndex={-1} role="dialog" aria-labelledby="dialog1Title" aria-describedby="dialog1Desc">
            <div class={'modal-title'} id="dialog1Title">
              <slot name="modal-title"></slot>
            </div>
            <div class="modal-body" id="dialog1Desc">
              {this.closeButton && (
                <ir-button
                  onButtonClick={e => {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    this.closeModal();
                  }}
                  variants="icon"
                  title={localizedWords.entries.Lcz_Close}
                  class="absolute right-3 top-3"
                  iconName="xmark"
                ></ir-button>
              )}
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
