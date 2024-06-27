import localizedWords from '@/stores/localization.store';
import { Component, Prop, h, Event, EventEmitter, State } from '@stencil/core';

@Component({
  tag: 'ir-adult-child-counter',
  styleUrl: 'ir-adult-child-counter.css',
  shadow: true,
})
export class IrAdultChildCounter {
  @Prop({ reflect: true, mutable: true }) adultCount = 0;
  @Prop({ mutable: true, reflect: true }) childrenCount = 0;
  @Prop() minAdultCount = 0;
  @Prop() minChildrenCount = 0;
  @Prop() maxAdultCount = 10;
  @Prop() maxChildrenCount = 10;
  @Prop() childMaxAge: number = 0;

  @Event() addAdultsAndChildren: EventEmitter<{ adult_nbr: number; child_nbr: number }>;
  @State() isPopoverOpen: boolean = false;

  private popover: HTMLIrPopoverElement;
  addChildrenAndAdult() {
    this.addAdultsAndChildren.emit({
      adult_nbr: this.adultCount,
      child_nbr: this.childrenCount,
    });
    this.popover.toggleVisibility();
  }

  incrementAdultCount() {
    const newValue = this.adultCount + 1;
    if (newValue > this.maxAdultCount) {
      return;
    }
    this.adultCount = newValue;
  }
  decrementAdultCount() {
    const newValue = this.adultCount - 1;
    if (newValue < this.minAdultCount) {
      return;
    }
    this.adultCount = newValue;
  }
  incrementChildrenCount() {
    const newValue = this.childrenCount + 1;
    if (newValue > this.maxChildrenCount) {
      return;
    }
    this.childrenCount = newValue;
  }
  decrementChildrenCount() {
    const newValue = this.childrenCount - 1;
    if (newValue < this.minChildrenCount) {
      return;
    }
    this.childrenCount = newValue;
  }
  guestTrigger() {
    return (
      <div class="popover-trigger w-full sm:w-fit" slot="trigger" data-state={this.isPopoverOpen ? 'opened' : 'closed'}>
        <ir-icons name="user" svgClassName="size-[18px]"></ir-icons>
        <div class="flex h-[3rem] flex-1 flex-col justify-center gap-0.5">
          <p class="label">{localizedWords.entries.Lcz_Guests}</p>
          <p class={'guests'}>
            {this.adultCount > 0 && (
              <span>
                {this.adultCount} {this.adultCount === 1 ? localizedWords.entries.Lcz_Adult : localizedWords.entries.Lcz_Adults}
              </span>
            )}
            {this.childrenCount > 0 && (
              <span>
                , {this.childrenCount} {this.childrenCount === 1 ? localizedWords.entries.Lcz_Child : localizedWords.entries.Lcz_Children}
              </span>
            )}
            {this.adultCount === 0 && <span class="">{localizedWords.entries.Lcz_Select}</span>}
          </p>
        </div>
      </div>
    );
  }
  handlePopoverToggle(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.isPopoverOpen = e.detail;
    if (!this.isPopoverOpen) {
      this.addAdultsAndChildren.emit({
        adult_nbr: this.adultCount,
        child_nbr: this.childrenCount,
      });
    }
  }
  render() {
    return (
      <ir-popover ref={el => (this.popover = el)} onOpenChange={this.handlePopoverToggle.bind(this)}>
        {this.guestTrigger()}
        <div class="counter-container w-full border-0 p-4 pt-14 shadow-none sm:w-auto sm:border sm:pt-4 sm:shadow-sm" slot="popover-content">
          <div class="counter-item">
            <div>
              <p class="main-text">{localizedWords.entries.Lcz_Adults}</p>
              <p class="secondary-text">
                {localizedWords.entries.Lcz_Age} {this.childMaxAge + 1}+
              </p>
            </div>
            <div class="counter-buttons-group" role="group">
              <ir-button
                iconName="minus"
                disabled={this.adultCount === this.minAdultCount}
                variants="icon"
                onButtonClick={this.decrementAdultCount.bind(this)}
                aria-label="Decrease adult count"
                svgClassName="h-[14px] w-[12.25px]"
              >
                {/* <svg slot="btn-icon" xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                  <path fill="currentColor" d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" />
                </svg> */}
              </ir-button>
              <p>{this.adultCount}</p>
              <ir-button
                iconName="plus"
                disabled={this.adultCount === this.maxAdultCount}
                variants="icon"
                onButtonClick={this.incrementAdultCount.bind(this)}
                aria-label="Increase adult count"
                svgClassName="h-[14px] w-[12.25px]"
              >
                {/* <svg slot="btn-icon" xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                  <path
                    fill="currentColor"
                    d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                  />
                </svg> */}
              </ir-button>
            </div>
          </div>
          <div class="counter-item">
            <div>
              <p class="main-text">{localizedWords.entries.Lcz_Children}</p>
              <p class="secondary-text">
                {localizedWords.entries.Lcz_Ages} 1-{this.childMaxAge}
              </p>
            </div>
            <div class="counter-buttons-group" role="group">
              <ir-button
                disabled={this.childrenCount === this.minChildrenCount}
                variants="icon"
                onButtonClick={this.decrementChildrenCount.bind(this)}
                aria-label="Decrease child count"
                iconName="minus"
                svgClassName="h-[14px] w-[12.25px]"
              >
                {/* <svg slot="btn-icon" xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                  <path fill="currentColor" d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" />
                </svg> */}
              </ir-button>
              <p>{this.childrenCount}</p>
              <ir-button
                disabled={this.childrenCount === this.maxChildrenCount}
                variants="icon"
                onButtonClick={this.incrementChildrenCount.bind(this)}
                aria-label="Increase child count"
                iconName="plus"
                svgClassName="h-[14px] w-[12.25px]"
              >
                {/* <svg slot="btn-icon" xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                  <path
                    fill="currentColor"
                    d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                  />
                </svg> */}
              </ir-button>
            </div>
          </div>
          <ir-button
            onButtonClick={this.addChildrenAndAdult.bind(this)}
            size="md"
            class="done-button"
            label={localizedWords.entries.Lcz_Done}
            aria-label="Confirm selection"
          ></ir-button>
        </div>
      </ir-popover>
    );
  }
}
