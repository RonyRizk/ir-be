import { addOverlay, removeOverlay } from '@/stores/overlay.store';
import { Component, Element, Listen, State, Method, Event, EventEmitter, Prop } from '@stencil/core';

@Component({
  tag: 'ir-modal',
  styleUrl: 'ir-modal.css',
  shadow: false,
})
export class IrModal {
  @Element() el: HTMLElement;
  @Prop() element: HTMLElement;
  private firstFocusableElement: HTMLElement;
  private lastFocusableElement: HTMLElement;

  @State() isOpen = false;
  private portal: HTMLDivElement;
  private overlay: HTMLDivElement;
  private modalContainer: HTMLElement;

  @Event() openChange: EventEmitter<boolean>;
  auth: HTMLIrAuthElement;

  componentWillLoad() {
    this.createPortal();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  @Method()
  async openModal() {
    this.isOpen = true;
    this.openChange.emit(this.isOpen);
    addOverlay();
    this.createOverlay();
    this.insertModalContent();
    this.prepareFocusTrap();
  }

  @Method()
  async closeModal() {
    this.isOpen = false;
    this.openChange.emit(this.isOpen);
    removeOverlay();
    this.removeModalContent();
    this.removeOverlay();
  }

  createPortal() {
    if (!this.portal) {
      this.portal = document.createElement('div');
      this.portal.className = 'ir-portal';
      this.portal.style.position = 'relative';
      document.body.appendChild(this.portal);
    }
  }

  createOverlay() {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'overlay';
      this.overlay.addEventListener('click', () => this.closeModal());
      this.portal.appendChild(this.overlay);
    }
  }

  removeOverlay() {
    if (this.overlay) {
      this.overlay.removeEventListener('click', () => this.closeModal());
      if (this.overlay.parentNode === this.portal) {
        this.portal.removeChild(this.overlay);
      }
      this.overlay = null;
    }
  }

  insertModalContent() {
    if (!this.modalContainer) {
      this.modalContainer = document.createElement('div');
      this.modalContainer.className = 'modal-container';
      this.auth = document.createElement('ir-auth');
      this.auth.addEventListener('closeDialog', () => this.closeModal());
      this.modalContainer.appendChild(this.auth);
      this.portal.appendChild(this.modalContainer);
    }
  }

  removeModalContent() {
    if (this.modalContainer) {
      if (this.auth) {
        this.auth.removeEventListener('closeDialog', () => this.closeModal());
      }
      if (this.modalContainer.parentNode === this.portal) {
        this.portal.removeChild(this.modalContainer);
      }
      this.modalContainer = null;
      this.auth = null;
    }
  }

  prepareFocusTrap() {
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableContent: NodeListOf<HTMLElement> = this.portal.querySelectorAll(focusableElements);
    if (focusableContent.length === 0) return;

    this.firstFocusableElement = focusableContent[0];
    this.lastFocusableElement = focusableContent[focusableContent.length - 1];
    this.firstFocusableElement.focus();
  }

  @Listen('keydown', { target: 'document' })
  handleKeyDown(ev: KeyboardEvent) {
    if (!this.isOpen) {
      return;
    }
    let isTabPressed = ev.key === 'Tab';
    if (ev.key === 'Escape') {
      ev.preventDefault();
      this.closeModal();
    }
    if (!isTabPressed) return;

    if (ev.shiftKey) {
      if (document.activeElement === this.firstFocusableElement) {
        this.lastFocusableElement.focus();
        ev.preventDefault();
      }
    } else {
      if (document.activeElement === this.lastFocusableElement) {
        this.firstFocusableElement.focus();
        ev.preventDefault();
      }
    }
  }

  cleanup() {
    this.removeOverlay();
    this.removeModalContent();
    if (this.portal && this.portal.parentNode) {
      document.body.removeChild(this.portal);
      this.portal = null;
    }
  }

  render() {
    return null;
  }
}
