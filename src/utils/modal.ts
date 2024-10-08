interface ModalOptions {
  onFocusOut?: (event: Event) => void;
}

let activeModals: HTMLElement[] = [];

export default class Modal {
  element: HTMLElement;
  options?: ModalOptions;

  constructor(element: HTMLElement, options?: ModalOptions) {
    this.element = element;
    this.options = options;
    this.handleFocusIn = this.handleFocusIn.bind(this);
  }

  activate() {
    activeModals.push(this.element);
    document.addEventListener('focusin', this.handleFocusIn);
  }

  deactivate() {
    activeModals = activeModals.filter(modal => modal !== this.element);
    document.removeEventListener('focusin', this.handleFocusIn);
  }

  isActive() {
    return activeModals[activeModals.length - 1] === this.element;
  }

  handleFocusIn(event: Event) {
    const target = event.target as HTMLElement;
    const tagName = this.element.tagName.toLowerCase();
    if (this.isActive() && target.closest(tagName) !== this.element && typeof this.options?.onFocusOut === 'function') {
      this.options?.onFocusOut(event);
    }
  }
}
