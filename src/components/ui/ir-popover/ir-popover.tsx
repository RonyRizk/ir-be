import { Component, h, Prop, State, Element, Method, Event, EventEmitter, Fragment, Listen } from '@stencil/core';
import { createPopper, Placement } from '@popperjs/core';
import localization_store from '@/stores/app.store';
import app_store from '@/stores/app.store';

@Component({
  tag: 'ir-popover',
  styleUrl: 'ir-popover.css',
  shadow: true,
})
export class IrPopover {
  @Element() el: HTMLElement;

  @Prop() active: boolean = false;
  @Prop() autoAdjust: boolean = true;
  @Prop() trigger_label: string = '';
  @Prop() placement: Placement;
  @Prop() stopListeningForOutsideClicks: boolean = false;
  @Prop() showCloseButton: boolean = true;
  @Prop() allowFlip: boolean = true;

  @State() isVisible: boolean = false;
  @State() isMobile: boolean = window.innerWidth < 640;

  @State() previousIsMobile: boolean = window.innerWidth < 640;
  @State() isDialogOpen: boolean;

  popoverInstance = null;
  triggerElement: HTMLElement;
  contentElement: HTMLElement;
  popupInitializing: NodeJS.Timeout;

  dialogElement: HTMLIrDialogElement;

  @Event() openChange: EventEmitter<boolean>;
  componentDidLoad() {
    this.initializePopover();
    document.addEventListener('click', this.handleOutsideClick, true);
    document.addEventListener('keydown', this.handleKeyboardPress, true);
  }
  handleKeyboardPress = (e: KeyboardEvent) => {
    if (!this.isVisible) {
      return;
    }
    if (e.key === 'Escape') {
      this.toggleVisibility();
    }
    return;
  };
  @Listen('resize', { target: 'window' })
  handleResize() {
    const currentIsMobile = window.innerWidth < 640;
    if (this.isMobile !== currentIsMobile) {
      this.previousIsMobile = this.isMobile;
      this.isMobile = currentIsMobile;
      if (this.previousIsMobile === false && this.isMobile === true && this.dialogElement) {
        this.dialogElement.closeModal();
        this.isVisible = false;
        this.openChange.emit(this.isVisible);
      }
      if (!this.isMobile && this.isVisible) {
        this.isVisible = false;
        this.popupInitializing = setTimeout(() => {
          this.initializePopover();
        }, 100);
      }
    }
    if (!currentIsMobile && this.dialogElement) {
      this.dialogElement = undefined;
      this.popupInitializing = setTimeout(() => {
        this.initializePopover();
      }, 100);
    }
  }

  initializePopover() {
    if (this.triggerElement && this.contentElement) {
      this.popoverInstance = createPopper(this.triggerElement, this.contentElement, {
        placement: this.placement?this.placement: localization_store.dir === 'LTR' ? 'bottom-start' : 'bottom-end',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 3],
              adaptive: true,
            },
          },
          {
            name: 'flip',
            enabled: app_store.app_data.injected ? false : this.allowFlip,
          },
        ],
      });
    }
  }

  @Method()
  async toggleVisibility() {
    this.isVisible = !this.isVisible;
    if (this.dialogElement) {
      this.dialogElement.closeModal();
    }
    if (this.isVisible && this.popoverInstance) {
      const currentDir = localization_store.dir.toLowerCase() || 'ltr';
      if (
        (this.popoverInstance.state.options.placement === 'bottom-start' && currentDir === 'rtl') ||
        (this.popoverInstance.state.options.placement === 'bottom-end' && currentDir === 'ltr')
      ) {
        let newPlacement = this.popoverInstance.state.options.placement;
        if (currentDir === 'rtl') {
          newPlacement = newPlacement.replace('bottom-start', 'bottom-end');
        } else {
          newPlacement = newPlacement.replace('bottom-end', 'bottom-start');
        }
        this.popoverInstance
          .setOptions({
            placement: newPlacement,
          })
          .then(() => {
            this.popoverInstance.update();
          });
      } else if ( (this.popoverInstance.state.options.placement === 'top-start' && currentDir === 'rtl') ||
      (this.popoverInstance.state.options.placement === 'top-end' && currentDir === 'ltr')) {
        let newPlacement = this.popoverInstance.state.options.placement;
        if (currentDir === 'rtl') {
          newPlacement = newPlacement.replace('top-start', 'top-end');
        } else {
          newPlacement = newPlacement.replace('top-end', 'top-start');
        }
        this.popoverInstance
          .setOptions({
            placement: newPlacement,
          })
          .then(() => {
            this.popoverInstance.update();
          });
      } else {
        this.popoverInstance.update();
      }
    }
    if (!app_store.app_data.injected&&this.autoAdjust) {
      this.adjustPopoverPlacement();
    }
    this.openChange.emit(this.isVisible);
  }
  adjustPopoverPlacement() {
    requestAnimationFrame(() => {
      const rect = this.contentElement.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        this.popoverInstance.setOptions({
          placement: 'top-end',
        });
      } else if (rect.top < 0) {
        this.popoverInstance.setOptions({
          placement: 'bottom-end',
        });
      }
      this.popoverInstance.update();
    });
  }

  handleOutsideClick = (event: MouseEvent) => {
    const outsideClick = typeof event.composedPath === 'function' && !event.composedPath().includes(this.el);
    if (outsideClick && this.isVisible) {
      this.isVisible = false;
      this.openChange.emit(this.isVisible);
    }
  };

  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick, true);
    document.removeEventListener('keydown', this.handleKeyboardPress, true);
    if (this.popoverInstance) {
      this.popoverInstance.destroy();
    }
    if (this.popupInitializing) {
      clearTimeout(this.popupInitializing);
    }
  }
  render() {
    return (
      <Fragment>
        {this.isMobile && (
          <div class="w-full md:hidden">
            <div
              class="w-full"
              onClick={() => {
                this.dialogElement.openModal();
              }}
            >
              <slot name="trigger" />
            </div>
            <ir-dialog
              closeButton={this.showCloseButton}
              ref={el => (this.dialogElement = el)}
              onOpenChange={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.isDialogOpen = e.detail;
                this.openChange.emit(e.detail);
              }}
            >
              <div slot="modal-body">
                <slot name="popover-content"></slot>
              </div>
            </ir-dialog>
          </div>
        )}
        {!this.isMobile && (
          <div class="hidden sm:block">
            <div
              ref={el => (this.triggerElement = el)}
              onClick={e => {
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.toggleVisibility();
              }}
            >
              <slot name="trigger">
                <button class="trigger">
                  <span>{this.trigger_label}</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </slot>
            </div>
            <div class="popover-content" ref={el => (this.contentElement = el)}>
              {this.isVisible && (
                <div>
                  <slot name="popover-content"></slot>
                </div>
              )}
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}
