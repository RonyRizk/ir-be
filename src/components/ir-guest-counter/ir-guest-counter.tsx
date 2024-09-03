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

  // Local state
  @State() adultCount: number = this.minAdultCount;
  @State() childrenCount: number = this.minChildrenCount;

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
      this.updateCounts.emit({ adultCount: this.adultCount, childrenCount: this.childrenCount });
    }
  }

  decrementAdultCount() {
    if (this.adultCount > this.minAdultCount) {
      this.adultCount--;
      this.updateCounts.emit({ adultCount: this.adultCount, childrenCount: this.childrenCount });
    }
  }

  incrementChildrenCount() {
    if (this.childrenCount < this.maxChildrenCount) {
      this.childrenCount++;
      this.updateCounts.emit({ adultCount: this.adultCount, childrenCount: this.childrenCount });
    }
  }

  decrementChildrenCount() {
    if (this.childrenCount > this.minChildrenCount) {
      this.childrenCount--;
      this.updateCounts.emit({ adultCount: this.adultCount, childrenCount: this.childrenCount });
    }
  }

  addChildrenAndAdult() {
    this.closeGuestCounter.emit(null);
  }

  render() {
    return (
      <div class="counter-container p-4">
        {/* Adult Counter */}
        <div class="counter-item">
          <div>
            <p class="main-text">Adults</p>
            <p class="secondary-text">Age {this.childMaxAge + 1}+</p>
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
              <p class="secondary-text">Ages 1-{this.childMaxAge}</p>
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
