import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import localizedWords from '@/stores/localization.store';
import { IExposedProperty } from '@/models/property';

@Component({
  tag: 'ir-widget-occupancy-popup',
  styleUrl: 'ir-widget-occupancy-popup.scss',
  shadow: true,
})
export class IrWidgetOccupancyPopup {
  @Prop() guests: { adultCount: number; childrenCount: number; infants: number; childrenAges: string[] };
  @Prop() property: IExposedProperty;
  @Prop() error: boolean;
  @Prop() disabled: boolean;
  @Prop({ attribute: 'absolute-icon' }) absoluteIcon: boolean = false;
  @Prop() isLoading: boolean;

  @Event() guestsChange: EventEmitter<{ adultCount: number; childrenCount: number; infants: number; childrenAges: string[] }>;

  private guestsWidgetPopupRef: HTMLIrPopupElement;

  private renderAdultChildTrigger(slot = 'trigger') {
    const { adultCount, childrenCount } = this.guests || { adultCount: 0, childrenCount: 0 };
    const childMaxAge = this.property?.adult_child_constraints?.child_max_age ?? 0;

    return (
      <button disabled={this.disabled} class={`ir-widget__guests-trigger relative ${this.absoluteIcon ? '--absolute-icon' : ''}`} part="guests-trigger" slot={slot}>
        <div class={this.absoluteIcon ? 'pointer-events-none absolute inset-y-0 start-2 flex  items-center' : ''}>
          <ir-icons name="user" class={`${slot}-icon`} removeClassName height={16} width={16} svgClassName="ir-widget__icon"></ir-icons>
        </div>
        <p class={'ir-widget__guests'}>
          {adultCount > 0 ? (
            <span>
              <span class="ir-widget__text-lower">
                {adultCount} {adultCount === 1 ? localizedWords.entries.Lcz_Adult : localizedWords.entries.Lcz_Adults}
              </span>
              {childMaxAge > 0 && (
                <span class="ir-widget__text-lower">
                  , {childrenCount} {childrenCount === 1 ? localizedWords.entries.Lcz_Child : localizedWords.entries.Lcz_Children}
                </span>
              )}
            </span>
          ) : (
            <span>Guests</span>
          )}
        </p>
      </button>
    );
  }

  private renderLoadingTrigger(slot = 'trigger') {
    return (
      <div
        class={`ir-widget__guests-trigger ir-widget__trigger--loading relative ${this.absoluteIcon ? '--absolute-icon' : ''}`}
        part="guests-trigger"
        slot={slot}
        aria-busy="true"
      >
        <div class={this.absoluteIcon ? 'pointer-events-none absolute inset-y-0 start-2 flex items-center' : ''}>
          <span class="ir-widget__loading-icon ir-widget__shimmer"></span>
        </div>
        <div class="ir-widget__loading-text">
          <span class="ir-widget__loading-line --primary ir-widget__shimmer"></span>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Host>
        <ir-popup class="ir-multi-property-occupancy-popup__popup" ref={el => (this.guestsWidgetPopupRef = el)}>
          {this.isLoading ? this.renderLoadingTrigger('anchor') : this.renderAdultChildTrigger('anchor')}
          {!this.isLoading && (
            <ir-guest-counter
              error={this.error}
              adults={this.guests?.adultCount}
              child={this.guests?.childrenCount}
              minAdultCount={0}
              maxAdultCount={this.property?.adult_child_constraints?.adult_max_nbr}
              maxChildrenCount={this.property?.adult_child_constraints?.child_max_nbr}
              childMaxAge={this.property?.adult_child_constraints?.child_max_age}
              onUpdateCounts={e => this.guestsChange.emit({ ...e.detail })}
              part="guest-counter"
              onCloseGuestCounter={() => this.guestsWidgetPopupRef.close()}
            ></ir-guest-counter>
          )}
        </ir-popup>
      </Host>
    );
  }
}
