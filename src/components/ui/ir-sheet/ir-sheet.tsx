import localizedWords from '@/stores/localization.store';
import { addOverlay, removeOverlay } from '@/stores/overlay.store';
import { Component, Event, EventEmitter, Host, Listen, Method, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-sheet',
  styleUrl: 'ir-sheet.css',
  shadow: true,
})
export class IrSheet {
  @Prop() open: boolean;
  @Prop() hideCloseButton: boolean;

  @State() isVisible = false;

  @Event() openChange: EventEmitter<boolean>;

  componentWillLoad() {
    if (this.open) {
      if (this.isVisible) {
        return this.closeSheet();
      }
      this.openSheet();
    }
  }
  @Listen('keydown', { target: 'body' })
  handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Escape') {
      return;
    }
    if (this.isVisible) {
      this.closeSheet();
    }
  }
  @Watch('open')
  handleOpenChange(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue) {
      return newValue ? this.openSheet() : this.closeSheet();
    }
  }

  @Method()
  async openSheet() {
    addOverlay();
    this.isVisible = true;
    this.openChange.emit(this.isVisible);
  }
  @Method()
  async closeSheet() {
    removeOverlay();
    this.isVisible = false;
    this.openChange.emit(this.isVisible);
  }
  disconnectedCallback() {
    removeOverlay();
  }
  render() {
    return (
      <Host>
        <div class="backdrop" data-state={this.isVisible ? 'opened' : 'closed'} onClick={() => this.closeSheet()}></div>
        <div
          class="fixed right-0 top-0
          z-50 h-screen
          min-w-[70%] max-w-full bg-white shadow-md
          transition-transform duration-300 ease-in-out
        data-[state='closed']:translate-x-[100%] data-[state='opened']:translate-x-0"
          data-state={this.isVisible ? 'opened' : 'closed'}
        >
          <ir-button variants="icon" title={localizedWords.entries.Lcz_Close} iconName="xmark" onButtonClick={() => this.closeSheet()} class="absolute right-4 top-4">
            {/* <p slot="btn-icon" class="sr-only">
              close sheet
            </p>
            <svg slot="btn-icon" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path
                fill="currentColor"
                d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
              />
            </svg> */}
          </ir-button>
          <div class="mt-8 w-full">
            <slot name="sheet-content"></slot>
          </div>
        </div>
      </Host>
    );
  }
}
