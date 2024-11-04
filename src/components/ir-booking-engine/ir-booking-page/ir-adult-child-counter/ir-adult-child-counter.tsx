import localizedWords from '@/stores/localization.store';
import { calculateInfantNumber } from '@/utils/utils';
import { Component, Prop, h, Event, EventEmitter, State, Fragment, Method, Watch } from '@stencil/core';
export type AddAdultsAndChildrenEvent = { adult_nbr: number; child_nbr: number; infant_nbr: number; childrenAges: string[] };
@Component({
  tag: 'ir-adult-child-counter',
  styleUrl: 'ir-adult-child-counter.css',
  shadow: true,
})
export class IrAdultChildCounter {
  @Prop({ mutable: true }) adultCount = 2;
  @Prop({ mutable: true }) childrenCount = 0;
  @Prop({ mutable: true }) infant_nbr = 0;
  @Prop({ mutable: true }) error: boolean;
  @Prop() minAdultCount = 0;
  @Prop() minChildrenCount = 0;
  @Prop() maxAdultCount = 10;
  @Prop() maxChildrenCount = 10;
  @Prop() childMaxAge: number = 0;
  @Prop() baseChildrenAges: string[] = [];

  @State() isPopoverOpen: boolean = false;
  @State() childrenAges: string[] = [];

  @Event()
  addAdultsAndChildren: EventEmitter<AddAdultsAndChildrenEvent>;

  private popover: HTMLIrPopoverElement;

  componentWillLoad() {
    this.childrenAges = [...this.baseChildrenAges];
  }

  @Watch('baseChildrenAges')
  handleBaseChildrenAgesChange(newValue: string[]) {
    this.childrenAges = [...newValue];
  }
  @Method()
  async open() {
    if (this.isPopoverOpen) {
      return;
    }
    this.popover.toggleVisibility();
  }

  private addChildrenAndAdult() {
    this.error = false;
    this.updateGuestInformation();
    this.validateChildrenAges();
  }

  private incrementAdultCount() {
    const newValue = this.adultCount + 1;
    if (newValue > this.maxAdultCount) {
      return;
    }
    this.adultCount = newValue;
  }

  private decrementAdultCount() {
    const newValue = this.adultCount - 1;
    if (newValue < this.minAdultCount) {
      return;
    }
    this.adultCount = newValue;
  }

  private incrementChildrenCount() {
    const newValue = this.childrenCount + 1;
    if (newValue > this.maxChildrenCount) {
      return;
    }

    this.childrenAges.push('');
    this.childrenCount = newValue;
  }

  private decrementChildrenCount() {
    const newValue = this.childrenCount - 1;
    if (newValue < this.minChildrenCount) {
      return;
    }
    this.childrenAges.pop();
    this.childrenCount = newValue;
  }

  private handlePopoverToggle(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.isPopoverOpen = e.detail;
    if (!this.isPopoverOpen) {
      if (this.childrenCount === 0) {
        this.popover.forceClose();
      } else {
        this.validateChildrenAges();
      }
      this.updateGuestInformation();
    }
  }

  private updateGuestInformation() {
    const infant_nbr = calculateInfantNumber(this.childrenAges);
    const config = {
      adult_nbr: this.adultCount,
      child_nbr: this.childrenCount,
      infant_nbr,
      childrenAges: this.childrenAges,
    };
    console.log(config);
    this.addAdultsAndChildren.emit(config);
  }
  private validateChildrenAges() {
    if (this.childrenAges.some(c => c === '')) {
      this.error = true;
      return;
    }
    this.popover.forceClose();
  }
  private guestTrigger() {
    return (
      <div class="popover-trigger w-full sm:w-fit" slot="trigger" data-state={this.isPopoverOpen ? 'opened' : 'closed'}>
        <ir-icons name="user" svgClassName="size-[1.125rem]"></ir-icons>
        <div class="flex h-[3rem] flex-1 flex-col justify-center gap-0.5">
          <p class="label">{localizedWords.entries.Lcz_Guests}</p>
          <p class={'guests'}>
            {this.adultCount > 0 ? (
              <Fragment>
                <span class={'lowercase'}>
                  {this.adultCount} {this.adultCount === 1 ? localizedWords.entries.Lcz_Adult : localizedWords.entries.Lcz_Adults}
                </span>
                {this.childMaxAge > 0 && (
                  <span class={'lowercase'}>
                    , {this.childrenCount} {this.childrenCount === 1 ? localizedWords.entries.Lcz_Child : localizedWords.entries.Lcz_Children}
                  </span>
                )}
              </Fragment>
            ) : (
              <span class="">{localizedWords.entries.Lcz_Select}...</span>
            )}
          </p>
        </div>
      </div>
    );
  }
  render() {
    console.log(this.childrenAges);
    return (
      <ir-popover
        ref={el => (this.popover = el)}
        allowFlip={false}
        placement="bottom-end"
        autoAdjust={false}
        outsideEvents="none"
        onOpenChange={this.handlePopoverToggle.bind(this)}
      >
        {this.guestTrigger()}
        <div class="counter-container  w-full border-0 p-4 pt-14 shadow-none sm:w-auto sm:border sm:pt-4 sm:shadow-sm" slot="popover-content">
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
              <p class={'text-base'}>{this.adultCount}</p>
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
          {this.childMaxAge > 0 && (
            <div class="counter-item">
              <div>
                <p class="main-text">{localizedWords.entries.Lcz_Children}</p>
                <p class="secondary-text">
                  {localizedWords.entries.Lcz_Age} 0-{this.childMaxAge}
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
                <p class={'text-base'}>{this.childrenCount}</p>
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
          )}
          {this.childrenAges?.map((v, i) => (
            <div>
              <ir-select
                addDummyOption
                value={v}
                key={`child_${i}_age`}
                data-state={this.error && v === '' ? 'error' : ''}
                variant="double-line"
                label={`Child ${i + 1} age`}
                onValueChange={e => {
                  const prev = [...this.childrenAges];
                  prev[i] = e.detail.toString();
                  this.childrenAges = [...prev];
                }}
                data={[...Array(this.childMaxAge)].map((_, index) => ({
                  id: index.toString(),
                  value: index === 0 ? localizedWords.entries['Lcz_under1'] : index.toString(),
                }))}
              ></ir-select>
              {this.error && v === '' && <p class={'m-0 p-0 text-xs text-red-500'}>{localizedWords.entries.Lcz_enterchildage}</p>}
            </div>
          ))}
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
