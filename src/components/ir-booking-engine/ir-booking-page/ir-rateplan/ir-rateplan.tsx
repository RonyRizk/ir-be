import { Component, Event, EventEmitter, Fragment, Prop, State, Watch, h } from '@stencil/core';
import { RatePlan, Variation } from '@/models/property';
import app_store from '@/stores/app.store';
import booking_store, { IRatePlanSelection, reserveRooms, updateRoomParams } from '@/stores/booking';
import { formatAmount } from '@/utils/utils';
import localizedWords from '@/stores/localization.store';
import { v4 } from 'uuid';
import { PropertyService } from '@/services/api/property.service';
import { format } from 'date-fns';
import { AvailabiltyService } from '@/services/app/availability.service';
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

  @Event() animateBookingButton: EventEmitter<null>;

  private propertyService = new PropertyService();
  private availabilityService = new AvailabiltyService();
  @State() isRatePlanAvailable: boolean = true;
  componentWillLoad() {
    this.propertyService.setToken(app_store.app_data.token);
    this.checkAvailability();
  }
  @Watch('roomTypeInventory')
  handleRTICHange(newValue: number, oldValue: number) {
    if (newValue === oldValue) {
      return null;
    }
    this.checkAvailability();
  }
  checkAvailability() {
    this.isRatePlanAvailable = this.roomTypeInventory > 0 && this.ratePlan.variations.some(v => v.is_calculated && !(v.amount === 0 || v.amount === null));
  }
  async handleVariationChange(e: CustomEvent, variations: Variation[], rateplanId: number, roomTypeId: number) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const value = e.detail;
    let selectedVariation = variations[value];
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
  async updateVariation(params: { adult_nbr: number; child_nbr: number; rt_id: number; rp_id: number; adultChildConstraint: string }) {
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
  render() {
    // console.log('ratePlan', this.ratePlan);
    return (
      <div class="rateplan-container">
        <div class={`rateplan-header ${this.isRatePlanAvailable ? 'available' : 'not-available'}`}>
          <p class="rateplan-name">
            <span class="rateplan-short-name">{this.ratePlan.short_name}</span>
            <span class="rateplan-custom-text rateplan-custom-text-hidden">{this.ratePlan.custom_text}</span>
          </p>
          {this.isLoading ? (
            <div class="grid place-items-center md:hidden">
              <div class="h-4 w-12 animate-pulse rounded-md bg-gray-300"></div>
            </div>
          ) : (
            <Fragment>
              {this.isRatePlanAvailable ? (
                <div class="rateplan-pricing-mobile">
                  <p class="rateplan-amount">{formatAmount(this.visibleInventory?.selected_variation?.variation?.amount, app_store.userPreferences.currency_id, 0)}</p>
                  {this.visibleInventory?.selected_variation?.variation?.discount_pct > 0 && (
                    <p class="rateplan-discounted-amount">
                      {formatAmount(this.visibleInventory?.selected_variation?.variation?.total_before_discount, app_store.userPreferences.currency_id, 0)}
                    </p>
                  )}
                </div>
              ) : (
                <p class="no-availability">Not available</p>
              )}
            </Fragment>
          )}
        </div>

        <p class="rateplan-custom-text rateplan-custom-text-mobile">{this.ratePlan.custom_text}</p>

        {this.isRatePlanAvailable && (
          <div class={`rateplan-details ${this.ratePlan.custom_text ? 'rateplan-details-no-custom-text' : ''}`}>
            {this.isLoading ? (
              <div class="col-span-6 w-full ">
                <div class="h-8 w-full animate-pulse rounded-md bg-gray-300"></div>
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
                  <div class="rateplan-cancellation gap-2.5">
                    {this.ratePlan.is_non_refundable ? (
                      <p class="text-xs text-green-500">Non refundable</p>
                    ) : (
                      <div class="flex items-center gap-[2px] ">
                        {/* <p class="rateplan-cancellation-text">If I cancel?</p> */}
                        <ir-tooltip class="rateplan-tooltip" label="If I cancel?" message={this.ratePlan.cancelation + '<br>' + this.ratePlan.guarantee}></ir-tooltip>
                      </div>
                    )}
                  </div>
                </div>

                {this.visibleInventory?.selected_variation?.variation?.discount_pct > 0 && (
                  <div class="rateplan-pricing">
                    <p class="rateplan-discounted-amount">
                      {formatAmount(this.visibleInventory?.selected_variation?.variation?.total_before_discount, app_store.userPreferences.currency_id, 0)}
                    </p>
                    <p class="rateplan-discount">{`-${this.visibleInventory?.selected_variation?.variation?.discount_pct}%`}</p>
                  </div>
                )}
                <div class="rateplan-final-pricing">
                  <p class="rateplan-amount">{formatAmount(this.visibleInventory?.selected_variation?.variation?.amount, app_store.userPreferences.currency_id, 0)}</p>
                  <p class="rateplan-amount-per-night">{`${formatAmount(this.visibleInventory?.selected_variation?.variation?.amount_per_night, app_store.userPreferences.currency_id, 0)}/${localizedWords.entries.Lcz_night}`}</p>
                </div>

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
                        ? `${localizedWords.entries.Lcz_Select}`
                        : `${i}&nbsp;&nbsp;&nbsp;${i === 0 ? '' : formatAmount(this.visibleInventory?.selected_variation?.variation?.amount * i, app_store.userPreferences.currency_id, 0)}`,
                    disabled: i >= this.visibleInventory?.visibleInventory + 1,
                    html: true,
                  }))}
                ></ir-select>
              </Fragment>
            )}
          </div>
        )}
      </div>
    );
  }
}
