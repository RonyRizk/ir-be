import { Component, Event, EventEmitter, Fragment, Prop, State, Watch, h } from '@stencil/core';
import { RatePlan, Variation } from '@/models/property';
import app_store from '@/stores/app.store';
import booking_store, { IRatePlanSelection, reserveRooms, updateRoomParams } from '@/stores/booking';
import { formatAmount, getDateDifference } from '@/utils/utils';
import localizedWords from '@/stores/localization.store';
import { PaymentService } from '@/services/api/payment.service';
import { isRequestPending } from '@/stores/ir-interceptor.store';
@Component({
  tag: 'ir-rateplan',
  styleUrl: 'ir-rateplan.css',
  shadow: true,
})
export class IrRateplan {
  @Prop({ reflect: true }) display: 'grid' | 'default' = 'default';
  @Prop() ratePlan: RatePlan;
  @Prop() visibleInventory?:
    | IRatePlanSelection
    | {
        reserved: number;
        visibleInventory?: number;
        selected_variation: Variation;
      };
  @Prop() roomTypeInventory: number;
  @Prop() roomTypeId: number;

  @State() isLoading = false;
  @State() cancelationMessage = '';
  @State() isRatePlanAvailable: boolean = true;

  @Event() animateBookingButton: EventEmitter<null>;

  private paymentService = new PaymentService();

  componentWillLoad() {
    this.checkAvailability();
  }
  @Watch('roomTypeInventory')
  handleRTICHange(newValue: number, oldValue: number) {
    if (newValue === oldValue) {
      return null;
    }
    this.checkAvailability();
  }
  private checkAvailability() {
    this.isRatePlanAvailable =
      this.roomTypeInventory > 0 && (this.ratePlan.is_available_to_book || (!this.ratePlan.is_available_to_book && this.ratePlan.not_available_reason?.includes('MLS')));
  }
  private async handleVariationChange(e: CustomEvent, variations: Variation[], rateplanId: number, roomTypeId: number) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const value = e.detail;
    let selectedVariation = variations[value];
    if (!selectedVariation) {
      return;
    }
    selectedVariation = booking_store.roomTypes.find(rt => rt.id === roomTypeId).rateplans.find(rp => rp.id === rateplanId).variations[value];
    updateRoomParams({ params: { selected_variation: selectedVariation }, ratePlanId: rateplanId, roomTypeId });
  }
  private async fetchCancelationMessage() {
    this.cancelationMessage = this.paymentService.getCancelationMessage(this.visibleInventory.selected_variation?.applicable_policies, true)?.message;
  }
  render() {
    if (!this.ratePlan.is_targeting_travel_agency && booking_store.bookingAvailabilityParams.agent) {
      return null;
    }
    if (this.ratePlan.is_targeting_travel_agency && !app_store.app_data.isAgentMode) {
      return null;
    }
    const isInFreeCancelationZone = this.paymentService.checkFreeCancelationZone(this.visibleInventory?.selected_variation?.applicable_policies);
    const isInventoryFull =
      this.visibleInventory?.visibleInventory === 0 ||
      !this.visibleInventory?.selected_variation?.discounted_amount ||
      Object.values(booking_store.ratePlanSelections[this.roomTypeId]).some(f => f.visibleInventory === f.reserved);
    return (
      <div class="rateplan-container">
        <div class={`rateplan-header ${this.isRatePlanAvailable ? 'available' : 'not-available'}`}>
          <div class="rateplan-details-wrapper">
            <p class="rateplan-name">
              <span class="rateplan-short-name">{this.ratePlan.short_name}</span>
              {this.ratePlan.is_non_refundable ? (
                <p class="rateplan-tooltip text-xs" style={{ color: 'var(--ir-green)' }}>
                  {localizedWords.entries.Lcz_NonRefundable}
                </p>
              ) : (
                this.ratePlan.is_available_to_book && (
                  <ir-tooltip
                    labelColors={isInFreeCancelationZone ? 'green' : 'default'}
                    class={`rateplan-tooltip`}
                    open_behavior="click"
                    label={isInFreeCancelationZone ? localizedWords.entries.Lcz_FreeCancellation : localizedWords.entries.Lcz_IfICancel}
                    message={`${this.cancelationMessage || this.ratePlan.cancelation} ${this.ratePlan.guarantee ?? ''}`}
                    onTooltipOpenChange={e => {
                      if (e.detail) {
                        this.fetchCancelationMessage();
                      }
                    }}
                  ></ir-tooltip>
                )
              )}
            </p>
            {this.isLoading ? (
              <div class="grid place-items-center md:hidden">
                <ir-skeleton class="h-4 w-12"></ir-skeleton>
              </div>
            ) : (
              <Fragment>
                {this.isRatePlanAvailable ? (
                  this.visibleInventory?.selected_variation?.discounted_amount && (
                    <div class="rateplan-pricing-mobile">
                      {this.visibleInventory?.selected_variation?.discount_pct > 0 && (
                        <p class="rateplan-discounted-amount">{formatAmount(this.visibleInventory?.selected_variation?.amount, app_store.userPreferences.currency_id, 0)}</p>
                      )}
                      <p class="rateplan-amount">{formatAmount(this.visibleInventory?.selected_variation?.discounted_amount, app_store.userPreferences.currency_id, 0)}</p>
                    </div>
                  )
                ) : (
                  <p class="no-availability">{localizedWords.entries.Lcz_NotAvailable}</p>
                )}
              </Fragment>
            )}
          </div>
          <div class="rateplan-description">
            <div class="flex items-center justify-between">
              {this.ratePlan.is_non_refundable ? (
                <p class="rateplan-tooltip text-xs" style={{ color: 'var(--ir-green)' }}>
                  {localizedWords.entries.Lcz_NonRefundable}
                </p>
              ) : (
                this.ratePlan.is_available_to_book && (
                  <ir-tooltip
                    labelColors={isInFreeCancelationZone ? 'green' : 'default'}
                    class={`rateplan-tooltip`}
                    open_behavior="click"
                    label={isInFreeCancelationZone ? localizedWords.entries.Lcz_FreeCancellation : localizedWords.entries.Lcz_IfICancel}
                    message={`${(this.cancelationMessage ?? '') || (this.ratePlan.cancelation ?? '')} ${this.ratePlan.guarantee ?? ''}`}
                    onTooltipOpenChange={e => {
                      if (e.detail) {
                        this.fetchCancelationMessage();
                      }
                    }}
                  ></ir-tooltip>
                )
              )}
              {getDateDifference(booking_store.bookingAvailabilityParams.from_date ?? new Date(), booking_store.bookingAvailabilityParams.to_date ?? new Date()) > 1 && (
                <p class="rateplan-amount-per-night grid-view">{`${formatAmount(this.visibleInventory?.selected_variation?.amount_per_night, app_store.userPreferences.currency_id, 0)}/${localizedWords.entries.Lcz_night}`}</p>
              )}
            </div>
            <p class="rateplan-custom-text" innerHTML={this.ratePlan.custom_text}></p>
          </div>
        </div>
        {this.isRatePlanAvailable && (
          <div class={`rateplan-details ${this.ratePlan.custom_text ? 'rateplan-details-no-custom-text' : ''}`}>
            {this.isLoading ? (
              <div class="col-span-6 w-full ">
                <ir-skeleton class="block h-12 w-full"></ir-skeleton>
              </div>
            ) : (
              <Fragment>
                <div class="rateplan-travelers">
                  {this.ratePlan.variations && this.ratePlan.is_available_to_book && (
                    <ir-select
                      class="rateplan-select-travelers"
                      label={'Travelers'}
                      value={this.ratePlan.variations
                        .findIndex(
                          f =>
                            `${f.adult_nbr}_a_${f.child_nbr}_c` ===
                            `${this.visibleInventory?.selected_variation?.adult_nbr}_a_${this.visibleInventory?.selected_variation?.child_nbr}_c`,
                        )
                        .toString()}
                      onValueChange={e => {
                        this.handleVariationChange(e, this.ratePlan.variations, this.ratePlan.id, this.roomTypeId);
                      }}
                      data={this.ratePlan.variations.map((v, i) => ({
                        id: i.toString(),
                        value: this.formatVariation(v),
                      }))}
                    ></ir-select>
                  )}
                </div>

                {!this.ratePlan.not_available_reason?.includes('MLS') ? (
                  <Fragment>
                    {this.visibleInventory?.selected_variation?.discounted_amount && (
                      <Fragment>
                        {this.visibleInventory?.selected_variation?.discount_pct > 0 && (
                          <div class="rateplan-pricing">
                            <p class="rateplan-discounted-amount">{formatAmount(this.visibleInventory?.selected_variation?.amount, app_store.userPreferences.currency_id, 0)}</p>
                            <p class="rateplan-discount">{`-${Number(this.visibleInventory?.selected_variation?.discount_pct).toPrecision(2)}%`}</p>
                          </div>
                        )}
                        <div class="rateplan-final-pricing" data-style={this.visibleInventory?.selected_variation?.discount_pct > 0 ? '' : 'full-width'}>
                          <p class="rateplan-amount">{formatAmount(this.visibleInventory?.selected_variation?.discounted_amount, app_store.userPreferences.currency_id, 0)}</p>
                          {getDateDifference(booking_store.bookingAvailabilityParams.from_date ?? new Date(), booking_store.bookingAvailabilityParams.to_date ?? new Date()) >
                            1 && (
                            <p class="rateplan-amount-per-night">{`${formatAmount(this.visibleInventory?.selected_variation?.amount_per_night, app_store.userPreferences.currency_id, 0)}/${localizedWords.entries.Lcz_night}`}</p>
                          )}
                        </div>
                      </Fragment>
                    )}
                    {this.visibleInventory?.reserved > 0 ? (
                      <ir-select
                        onValueChange={e => {
                          reserveRooms(this.roomTypeId, this.ratePlan.id, Number(e.detail));
                          this.animateBookingButton.emit(null);
                        }}
                        label={localizedWords.entries.Lcz_Rooms}
                        value={this.visibleInventory?.reserved}
                        class="rateplan-select-rooms"
                        data={[...new Array(this.roomTypeInventory + 1)]?.map((_, i) => ({
                          id: i,
                          value:
                            i === 0
                              ? `0`
                              : `${i}&nbsp;&nbsp;&nbsp;${i === 0 ? '' : formatAmount(this.visibleInventory?.selected_variation?.discounted_amount * i, app_store.userPreferences.currency_id, 0)}`,
                          disabled: i >= this.visibleInventory?.visibleInventory + 1,
                          html: true,
                        }))}
                        containerStyle={'triggerStyle'}
                        customStyles={'selectStyle'}
                      ></ir-select>
                    ) : (
                      <ir-button
                        disabled={isInventoryFull || isRequestPending('/Check_Availability')}
                        class="rateplan-select-rooms-btn"
                        buttonStyles={{ background: 'white', width: '100%', opacity: isInventoryFull ? '0.5' : '1' }}
                        label={localizedWords.entries.Lcz_Select}
                        variants="outline-primary"
                        onButtonClick={() => {
                          reserveRooms(this.roomTypeId, this.ratePlan.id, 1);
                          this.animateBookingButton.emit(null);
                        }}
                      ></ir-button>
                    )}
                  </Fragment>
                ) : (
                  <p class="mls_alert">{localizedWords.entries.Lcz_MLS_Alert.replace('{0}', this.ratePlan.not_available_reason?.replace('MLS-', ''))}</p>
                )}
              </Fragment>
            )}
          </div>
        )}
      </div>
    );
  }
  formatVariation(v: Variation): any {
    const adults = `${v.adult_nbr} ${v.adult_nbr === 1 ? localizedWords.entries.Lcz_Adult.toLowerCase() : localizedWords.entries.Lcz_Adults.toLowerCase()}`;
    const children =
      v.child_nbr > 0 ? `${v.child_nbr}  ${v.child_nbr > 1 ? localizedWords.entries.Lcz_Children.toLowerCase() : localizedWords.entries.Lcz_Child.toLowerCase()}` : null;
    return children ? `${adults} ${children}` : adults;
  }
}
