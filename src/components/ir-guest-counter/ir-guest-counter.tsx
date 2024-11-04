import localizedWords from '@/stores/localization.store';
import { calculateInfantNumber } from '@/utils/utils';
import { Component, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-guest-counter',
  styleUrl: 'ir-guest-counter.css',
  shadow: true,
})
export class IrGuestCounter {
  // Properties
  @Prop() minAdultCount: number = 1;
  @Prop() maxAdultCount: number = 5;
  @Prop() minChildrenCount: number = 0;
  @Prop() maxChildrenCount: number = 5;
  @Prop() childMaxAge: number = 17;
  @Prop() child: number;
  @Prop() adults: number;
  @Prop({ mutable: true }) error: boolean = false;

  // Local state
  @State() adultCount: number = this.minAdultCount;
  @State() childrenCount: number = this.minChildrenCount;
  @State() childrenAges: string[] = [];
  // Events
  @Event() updateCounts: EventEmitter;
  @Event() closeGuestCounter: EventEmitter;

  componentWillLoad() {
    this.adultCount = this.adults || this.minAdultCount;
    this.childrenCount = this.child || this.minAdultCount;
  }

  @Watch('adults')
  handleAdultsChange(newValue, oldValue) {
    if (newValue !== oldValue && newValue !== this.adultCount) {
      this.adultCount = newValue;
    }
  }
  @Watch('child')
  handleChildChange(newValue, oldValue) {
    if (newValue !== oldValue && newValue !== this.childrenCount) {
      this.childrenCount = newValue;
    }
  }
  incrementAdultCount() {
    if (this.adultCount < this.maxAdultCount) {
      this.adultCount++;
      this.emitCountHandler();
    }
  }

  decrementAdultCount() {
    if (this.adultCount > this.minAdultCount) {
      this.adultCount--;
      this.emitCountHandler();
    }
  }

  incrementChildrenCount() {
    if (this.childrenCount < this.maxChildrenCount) {
      const newValue = this.childrenCount + 1;
      if (newValue > this.maxChildrenCount) {
        return;
      }

      this.childrenAges.push('');
      this.childrenCount++;
      this.emitCountHandler();
    }
  }

  decrementChildrenCount() {
    if (this.childrenCount > this.minChildrenCount) {
      const newValue = this.childrenCount - 1;
      if (newValue < this.minChildrenCount) {
        return;
      }
      this.childrenAges.pop();
      this.childrenCount--;
      this.emitCountHandler();
    }
  }
  private validateChildrenAges() {
    if (this.childrenAges.some(c => c === '')) {
      this.error = true;
      return;
    }
    this.closeGuestCounter.emit(null);
    // this.popover.forceClose();
  }
  private emitCountHandler() {
    const infant_nbr = calculateInfantNumber(this.childrenAges);
    const config = {
      adultCount: this.adultCount,
      childrenCount: this.childrenCount,
      infants: infant_nbr,
      childrenAges: this.childrenAges,
    };
    this.updateCounts.emit(config);
  }
  addChildrenAndAdult() {
    this.validateChildrenAges();
  }

  render() {
    return (
      <div class="counter-container p-4">
        {/* Adult Counter */}
        <div class="counter-item">
          <div>
            <p class="main-text">Adults</p>
            <p class="secondary-text">Ages {this.childMaxAge + 1}+</p>
          </div>
          <div class="counter-buttons-group">
            <ir-button
              iconName="minus"
              disabled={this.adultCount === this.minAdultCount}
              variants="icon"
              onButtonClick={this.decrementAdultCount.bind(this)}
              aria-label="Decrease adult count"
              svgClassName="h-[14px] w-[12.25px]"
            ></ir-button>
            <p>{this.adultCount}</p>
            <ir-button
              iconName="plus"
              disabled={this.adultCount === this.maxAdultCount}
              variants="icon"
              onButtonClick={this.incrementAdultCount.bind(this)}
              aria-label="Increase adult count"
              svgClassName="h-[14px] w-[12.25px]"
            ></ir-button>
          </div>
        </div>
        {/* Children Counter */}
        {this.childMaxAge > 0 && (
          <div class="counter-item">
            <div>
              <p class="main-text">Children</p>
              <p class="secondary-text">Ages 0-{this.childMaxAge}</p>
            </div>
            <div class="counter-buttons-group">
              <ir-button
                disabled={this.childrenCount === this.minChildrenCount}
                variants="icon"
                onButtonClick={this.decrementChildrenCount.bind(this)}
                aria-label="Decrease child count"
                iconName="minus"
                svgClassName="h-[14px] w-[12.25px]"
              ></ir-button>
              <p>{this.childrenCount}</p>
              <ir-button
                disabled={this.childrenCount === this.maxChildrenCount}
                variants="icon"
                onButtonClick={this.incrementChildrenCount.bind(this)}
                aria-label="Increase child count"
                iconName="plus"
                svgClassName="h-[14px] w-[12.25px]"
              ></ir-button>
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
                this.emitCountHandler();
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
          // label={localizedWords.entries.Lcz_Done}
          label="Done"
          aria-label="Confirm selection"
        ></ir-button>
      </div>
    );
  }
}
