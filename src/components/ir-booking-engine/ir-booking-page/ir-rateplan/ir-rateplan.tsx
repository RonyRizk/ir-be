import { Component, Event, EventEmitter, Fragment, Prop, State, Watch, h } from '@stencil/core';
import { RatePlan, Variation } from '@/models/property';
import app_store from '@/stores/app.store';
import booking_store, { IRatePlanSelection, reserveRooms, updateRoomParams } from '@/stores/booking';
import { formatAmount, getDateDifference } from '@/utils/utils';
import localizedWords from '@/stores/localization.store';
import { v4 } from 'uuid';
import { PropertyService } from '@/services/api/property.service';
import { format } from 'date-fns';
import { AvailabiltyService } from '@/services/app/availability.service';
import { PaymentService } from '@/services/api/payment.service';
@Component({
  tag: 'ir-rateplan',
  styleUrl: 'ir-rateplan.css',
  shadow: true,
})
export class IrRateplan {
  @Prop() ratePlan: RatePlan;
  @Prop() visibleInventory?:
    | IRatePlanSelection
    | {
        reserved: number;
        visibleInventory?: number;
        selected_variation: any;
      };
  @Prop() roomTypeInventory: number;
  @Prop() roomTypeId: number;

  @State() isLoading = false;
  @State() cancelationMessage = '';
  @State() isRatePlanAvailable: boolean = true;

  @Event() animateBookingButton: EventEmitter<null>;

  private propertyService = new PropertyService();
  private availabilityService = new AvailabiltyService();
  private paymentService = new PaymentService();

  componentWillLoad() {
    this.propertyService.setToken(app_store.app_data.token);
    this.paymentService.setToken(app_store.app_data.token);
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
    this.isRatePlanAvailable = this.roomTypeInventory > 0 && !this.ratePlan.variations.some(v => v.is_calculated && (v.amount === 0 || v.amount === null));
    // this.isRatePlanAvailable = this.roomTypeInventory > 0;
  }
  private async handleVariationChange(e: CustomEvent, variations: Variation[], rateplanId: number, roomTypeId: number) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const value = e.detail;
    let selectedVariation = variations[value];
    console.log(selectedVariation);
    if (!selectedVariation) {
      return;
    }
    if (!selectedVariation.amount) {
      this.isLoading = true;
      await this.updateVariation({
        adult_nbr: selectedVariation.adult_nbr,
        child_nbr: selectedVariation.child_nbr,
        rp_id: rateplanId,
        rt_id: roomTypeId,
        adultChildConstraint: selectedVariation.adult_child_offering,
      });
      this.isLoading = false;
    }
    selectedVariation = booking_store.roomTypes.find(rt => rt.id === roomTypeId).rateplans.find(rp => rp.id === rateplanId).variations[value];
    updateRoomParams({ params: { selected_variation: { variation: selectedVariation, state: 'modified' } }, ratePlanId: rateplanId, roomTypeId });
  }
  private async updateVariation(params: { adult_nbr: number; child_nbr: number; rt_id: number; rp_id: number; adultChildConstraint: string }) {
    const identifier = v4();
    this.availabilityService.initSocket(identifier, true);
    await this.propertyService.getExposedBookingAvailability({
      params: {
        propertyid: app_store.app_data.property_id,
        from_date: format(booking_store.bookingAvailabilityParams.from_date, 'yyyy-MM-dd'),
        to_date: format(booking_store.bookingAvailabilityParams.to_date, 'yyyy-MM-dd'),
        room_type_ids: [],
        adult_nbr: params.adult_nbr,
        child_nbr: params.child_nbr,
        language: app_store.userPreferences.language_id,
        currency_ref: app_store.userPreferences.currency_id,
        is_in_loyalty_mode: booking_store.bookingAvailabilityParams.loyalty ? true : !!booking_store.bookingAvailabilityParams.coupon,
        promo_key: booking_store.bookingAvailabilityParams.coupon || '',
        is_in_agent_mode: !!booking_store.bookingAvailabilityParams.agent || false,
        agent_id: booking_store.bookingAvailabilityParams.agent || 0,
      },
      identifier,
      mode: 'modify_rt',
      rp_id: params.rp_id,
      rt_id: params.rt_id,
      adultChildConstraint: params.adultChildConstraint,
    });
  }
  private async fetchCancelationMessage(id: number, roomTypeId: number) {
    this.cancelationMessage = (await this.paymentService.fetchCancelationMessage({ id, roomTypeId })).message;
  }
  render() {
    return (
      <div class="rateplan-container">
        <div class={`rateplan-header ${this.isRatePlanAvailable ? 'available' : 'not-available'}`}>
          <div class="rateplan-details-wrapper">
            <p class="rateplan-name">
              <span class="rateplan-short-name">{this.ratePlan.short_name}</span>
              {this.ratePlan.is_non_refundable ? (
                <p class="rateplan-tooltip text-xs" style={{ color: 'var(--ir-green)' }}>
                  Non refundable
                </p>
              ) : (
                <ir-tooltip
                  labelColors={booking_store.isInFreeCancelationZone ? 'green' : 'default'}
                  class={`rateplan-tooltip`}
                  open_behavior="click"
                  label={booking_store.isInFreeCancelationZone ? 'Free cancellation' : 'If I cancel?'}
                  message={(this.cancelationMessage || this.ratePlan.cancelation) + this.ratePlan.guarantee}
                  onTooltipOpenChange={e => {
                    if (e.detail) {
                      this.fetchCancelationMessage(this.ratePlan.id, this.roomTypeId);
                    }
                  }}
                ></ir-tooltip>
              )}
            </p>
            {this.isLoading ? (
              <div class="grid place-items-center md:hidden">
                <ir-skeleton class="h-4 w-12"></ir-skeleton>
              </div>
            ) : (
              <Fragment>
                {this.isRatePlanAvailable ? (
                  !this.visibleInventory?.selected_variation?.variation?.IS_MLS_VIOLATED && (
                    <div class="rateplan-pricing-mobile">
                      {this.visibleInventory?.selected_variation?.variation?.discount_pct > 0 && (
                        <p class="rateplan-discounted-amount">
                          {formatAmount(this.visibleInventory?.selected_variation?.variation?.total_before_discount, app_store.userPreferences.currency_id, 0)}
                        </p>
                      )}
                      <p class="rateplan-amount">{formatAmount(this.visibleInventory?.selected_variation?.variation?.amount, app_store.userPreferences.currency_id, 0)}</p>
                    </div>
                  )
                ) : (
                  <p class="no-availability">Not available</p>
                )}
              </Fragment>
            )}
          </div>
          <div class="rateplan-description">
            {this.ratePlan.is_non_refundable ? (
              <p class="rateplan-tooltip text-xs" style={{ color: 'var(--ir-green)' }}>
                Non refundable
              </p>
            ) : (
              <ir-tooltip
                labelColors={booking_store.isInFreeCancelationZone ? 'green' : 'default'}
                class={`rateplan-tooltip`}
                open_behavior="click"
                label={booking_store.isInFreeCancelationZone ? 'Free cancellation' : 'If I cancel?'}
                message={(this.cancelationMessage || this.ratePlan.cancelation) + this.ratePlan.guarantee}
                onTooltipOpenChange={e => {
                  if (e.detail) {
                    this.fetchCancelationMessage(this.ratePlan.id, this.roomTypeId);
                  }
                }}
              ></ir-tooltip>
            )}
            <p class="rateplan-custom-text">{this.ratePlan.custom_text}</p>
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
                  {this.ratePlan.variations && (
                    <ir-select
                      class="rateplan-select-travelers"
                      label={localizedWords.entries.Lcz_Travelers}
                      value={this.ratePlan.variations
                        .findIndex(f => f.adult_child_offering === this.visibleInventory?.selected_variation?.variation.adult_child_offering)
                        .toString()}
                      onValueChange={e => {
                        this.handleVariationChange(e, this.ratePlan.variations, this.ratePlan.id, this.roomTypeId);
                      }}
                      data={this.ratePlan.variations.map((v, i) => ({
                        id: i.toString(),
                        value: v.adult_child_offering,
                      }))}
                    ></ir-select>
                  )}
                </div>
                {!this.visibleInventory?.selected_variation?.variation?.IS_MLS_VIOLATED ? (
                  <Fragment>
                    {this.visibleInventory?.selected_variation?.variation?.discount_pct > 0 && (
                      <div class="rateplan-pricing">
                        <p class="rateplan-discounted-amount">
                          {formatAmount(this.visibleInventory?.selected_variation?.variation?.total_before_discount, app_store.userPreferences.currency_id, 0)}
                        </p>
                        <p class="rateplan-discount">{`-${this.visibleInventory?.selected_variation?.variation?.discount_pct}%`}</p>
                      </div>
                    )}
                    <div class="rateplan-final-pricing" data-style={this.visibleInventory?.selected_variation?.variation?.discount_pct > 0 ? '' : 'full-width'}>
                      <p class="rateplan-amount">{formatAmount(this.visibleInventory?.selected_variation?.variation?.amount, app_store.userPreferences.currency_id, 0)}</p>
                      {getDateDifference(booking_store.bookingAvailabilityParams.from_date ?? new Date(), booking_store.bookingAvailabilityParams.to_date ?? new Date()) > 1 && (
                        <p class="rateplan-amount-per-night">{`${formatAmount(this.visibleInventory?.selected_variation?.variation?.amount_per_night, app_store.userPreferences.currency_id, 0)}/${localizedWords.entries.Lcz_night}`}</p>
                      )}
                    </div>
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
                              : `${i}&nbsp;&nbsp;&nbsp;${i === 0 ? '' : formatAmount(this.visibleInventory?.selected_variation?.variation?.amount * i, app_store.userPreferences.currency_id, 0)}`,
                          disabled: i >= this.visibleInventory?.visibleInventory + 1,
                          html: true,
                        }))}
                        containerStyle={'triggerStyle'}
                        customStyles={'selectStyle'}
                      ></ir-select>
                    ) : (
                      <ir-button
                        class="rateplan-select-rooms"
                        buttonStyles={{ background: 'white', width: '100%' }}
                        label="Select"
                        variants="outline-primary"
                        onButtonClick={() => {
                          reserveRooms(this.roomTypeId, this.ratePlan.id, 1);
                          this.animateBookingButton.emit(null);
                        }}
                      ></ir-button>
                    )}
                  </Fragment>
                ) : (
                  <p class="mls_alert">{this.visibleInventory.selected_variation?.variation?.MLS_ALERT}</p>
                )}
              </Fragment>
            )}
          </div>
        )}
      </div>
    );
  }
}
