import { ISmokingOption, RatePlan, RoomType, Variation } from '@/models/property';
import { PaymentService } from '@/services/api/payment.service';
import { PropertyService } from '@/services/api/property.service';
import app_store from '@/stores/app.store';
import booking_store, { calculateTotalRooms, IRatePlanSelection } from '@/stores/booking';
import { checkout_store, onCheckoutDataChange } from '@/stores/checkout.store';
import localizedWords from '@/stores/localization.store';
import { formatAmount, getDateDifference } from '@/utils/utils';
import { Component, Host, Prop, State, h } from '@stencil/core';
import { format } from 'date-fns';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-booking-details',
  styleUrl: 'ir-booking-details.css',
  shadow: true,
})
export class IrBookingDetails {
  @Prop() errors: string;
  @State() currentRatePlan: RatePlan | null = null;
  @State() isLoading: number = null;
  @State() cancelationMessage: string;

  private dialogRef: HTMLIrDialogElement;
  private firstRoom: { roomtypeId: string; ratePlanId: string };
  private propertyService = new PropertyService();
  private paymentService = new PaymentService();

  componentWillLoad() {
    this.modifyBookings();
    onCheckoutDataChange('userFormData', newValue => {
      if (!checkout_store.modifiedGuestName) {
        this.updateGuestNames(newValue.bookingForSomeoneElse, newValue?.firstName, newValue?.lastName);
      }
    });
  }
  modifyBookings() {
    const result: any = {};

    Object.keys(booking_store.ratePlanSelections).map(roomTypeId => {
      result[roomTypeId] = {};
      return Object.keys(booking_store.ratePlanSelections[roomTypeId]).map(ratePlanId => {
        const r: IRatePlanSelection = booking_store.ratePlanSelections[roomTypeId][ratePlanId];
        if (r.reserved === 0) {
          result[roomTypeId][ratePlanId] = r;
        } else {
          if (!this.firstRoom) {
            this.firstRoom = {
              roomtypeId: roomTypeId,
              ratePlanId,
            };
          }
          result[roomTypeId][ratePlanId] = {
            ...r,
            checkoutVariations: Array(r.reserved).fill(r.selected_variation.variation),
            checkoutBedSelection: r.is_bed_configuration_enabled ? Array(r.reserved).fill(r.roomtype.bedding_setup[0].code) : [],
            checkoutSmokingSelection: Array(r.reserved).fill(r.roomtype.smoking_option[0]),
          };
          if (!checkout_store.modifiedGuestName && r.guestName?.length === 0) {
            const name = [...new Array(r.reserved)].map((_, i) => {
              if (i === 0 && !checkout_store.userFormData.bookingForSomeoneElse && this.firstRoom.roomtypeId === roomTypeId && this.firstRoom.ratePlanId === ratePlanId) {
                return (checkout_store.userFormData?.firstName || '') + ' ' + (checkout_store.userFormData?.lastName || '') || '';
              }
              return '';
            });
            result[roomTypeId][ratePlanId] = {
              ...result[roomTypeId][ratePlanId],
              guestName: name,
            };
          }
        }
      });
    });
    booking_store.ratePlanSelections = { ...result };
  }

  updateGuestNames(isBookingForSomeoneElse: boolean, firstName: string, lastName: string) {
    const result: any = {};

    Object.keys(booking_store.ratePlanSelections).forEach(roomTypeId => {
      result[roomTypeId] = {};
      Object.keys(booking_store.ratePlanSelections[roomTypeId]).forEach(ratePlanId => {
        const ratePlanSelection: IRatePlanSelection = booking_store.ratePlanSelections[roomTypeId][ratePlanId];
        if (this.firstRoom && this.firstRoom.ratePlanId === ratePlanId && this.firstRoom.roomtypeId === roomTypeId) {
          let updatedGuestNames = [...ratePlanSelection.guestName];
          updatedGuestNames[0] = isBookingForSomeoneElse ? '' : `${firstName || ''} ${lastName || ''}`.trim();
          result[roomTypeId][ratePlanId] = { ...ratePlanSelection, guestName: updatedGuestNames };
        } else {
          result[roomTypeId][ratePlanId] = ratePlanSelection;
        }
      });
    });

    booking_store.ratePlanSelections = { ...result };
  }

  handleGuestNameChange(index: number, e: InputEvent, rateplanId: number, roomTypeId: number): void {
    const oldVariations = [...booking_store.ratePlanSelections[roomTypeId][rateplanId]?.guestName];
    oldVariations[index] = (e.target as HTMLInputElement).value;
    booking_store.ratePlanSelections = {
      ...booking_store.ratePlanSelections,
      [roomTypeId]: {
        ...booking_store.ratePlanSelections[roomTypeId],
        [rateplanId]: {
          ...booking_store.ratePlanSelections[roomTypeId][rateplanId],
          guestName: oldVariations,
        },
      },
    };
  }

  async handleVariationChange(index: number, e: CustomEvent, variations: Variation[], rateplanId: number, roomTypeId: number) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const value = e.detail;
    let selectedVariation = variations[value];
    if (!selectedVariation) {
      return;
    }
    if (!selectedVariation.amount) {
      this.isLoading = rateplanId;
      const res = await this.updateVariation({
        adult_nbr: selectedVariation.adult_nbr,
        child_nbr: selectedVariation.child_nbr,
        rp_id: rateplanId,
        rt_id: roomTypeId,
        adultChildConstraint: selectedVariation.adult_child_offering,
      });
      selectedVariation = this.getNewSelectedVariation(res.roomtypes, selectedVariation, roomTypeId, rateplanId);
      this.isLoading = null;
    }
    const oldVariations = [...booking_store.ratePlanSelections[roomTypeId][rateplanId]?.checkoutVariations];
    oldVariations[index] = selectedVariation;
    booking_store.ratePlanSelections = {
      ...booking_store.ratePlanSelections,
      [roomTypeId]: {
        ...booking_store.ratePlanSelections[roomTypeId],
        [rateplanId]: {
          ...booking_store.ratePlanSelections[roomTypeId][rateplanId],
          selected_variation: { state: 'modified', variation: selectedVariation },
          checkoutVariations: oldVariations,
        },
      },
    };
    console.log(booking_store.ratePlanSelections);
  }
  getNewSelectedVariation(roomtypes: RoomType[], oldVariation: Variation, roomTypeId: number, rateplanId: number) {
    const roomType = roomtypes.find(rt => rt.id === roomTypeId);
    if (!roomType) {
      throw new Error('Invalid room type');
    }
    const rateplan = roomType.rateplans.find(rp => rp.id === rateplanId);
    if (!rateplan) {
      throw new Error('Invalid room type');
    }
    return rateplan.variations.find(v => v.adult_child_offering === oldVariation.adult_child_offering);
  }
  async updateVariation(params: { adult_nbr: number; child_nbr: number; rt_id: number; rp_id: number; adultChildConstraint: string }) {
    const identifier = v4();
    const res = await this.propertyService.getExposedBookingAvailability({
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
    return res.My_Result;
  }

  handleBedConfiguration(roomTypeId: string, rateplanId: string, detail: string | number, index: number): void {
    let oldBedConfiguration = [];
    if (booking_store.ratePlanSelections[roomTypeId][rateplanId]?.bed_configuration) {
      oldBedConfiguration = [...booking_store.ratePlanSelections[roomTypeId][rateplanId]?.checkoutBedSelection];
    }
    oldBedConfiguration[index] = detail;
    booking_store.ratePlanSelections = {
      ...booking_store.ratePlanSelections,
      [roomTypeId]: {
        ...booking_store.ratePlanSelections[roomTypeId],
        [rateplanId]: {
          ...booking_store.ratePlanSelections[roomTypeId][rateplanId],
          checkoutBedSelection: oldBedConfiguration,
        },
      },
    };
  }

  handleSmokeConfiguration(roomTypeId: string, rateplanId: string, detail: string | number, index: number): void {
    let oldSmokingConfiguration = [...booking_store.ratePlanSelections[roomTypeId][rateplanId]?.checkoutSmokingSelection];
    oldSmokingConfiguration[index] = detail;
    booking_store.ratePlanSelections = {
      ...booking_store.ratePlanSelections,
      [roomTypeId]: {
        ...booking_store.ratePlanSelections[roomTypeId],
        [rateplanId]: {
          ...booking_store.ratePlanSelections[roomTypeId][rateplanId],
          checkoutSmokingSelection: oldSmokingConfiguration,
        },
      },
    };
  }
  async fetchCancelationMessage(id: number, roomTypeId: number) {
    this.cancelationMessage = (await this.paymentService.fetchCancelationMessage({ id, roomTypeId })).message;
  }
  renderSmokingView(smoking_option: ISmokingOption, index: number, ratePlanId: string, roomTypeId: string, checkoutSmokingSelection: string[]) {
    if (smoking_option.code === '002') {
      return null;
    }
    if (smoking_option.code === '003') {
      return (
        <div class="section-item-footer-text">
          <ir-icons name={'ban_smoking'} svgClassName="size-4"></ir-icons>
          <p>{smoking_option.description}</p>
        </div>
      );
    }
    return (
      <ir-select
        icon
        onValueChange={e => this.handleSmokeConfiguration(roomTypeId, ratePlanId, e.detail, index)}
        value={checkoutSmokingSelection[index]}
        data={smoking_option.allowed_smoking_options.map(s => ({ id: s.code, value: s.description }))}
        class="hidden md:block"
      >
        <ir-icons name={checkoutSmokingSelection[index] !== '002' ? 'smoking' : 'ban_smoking'} slot="icon"></ir-icons>
      </ir-select>
    );
  }

  render() {
    console.log(this.firstRoom);
    const total_nights = getDateDifference(booking_store.bookingAvailabilityParams.from_date ?? new Date(), booking_store.bookingAvailabilityParams.to_date ?? new Date());
    const total_rooms = calculateTotalRooms();
    const total_persons = this.calculateTotalPersons();
    return (
      <Host>
        <div class="w-full">
          <section class="mb-5 flex flex-col flex-wrap items-center gap-2 rounded-md bg-gray-100 px-4 py-2 lg:flex-row">
            <div class="flex flex-1 items-center gap-2">
              <ir-icons name="bed"></ir-icons>
              <p>
                {total_nights} {total_nights > 1 ? localizedWords.entries.Lcz_Nights : localizedWords.entries.Lcz_night} - {total_persons}{' '}
                {total_persons > 1 ? localizedWords.entries.Lcz_Persons : localizedWords.entries.Lcz_Person} - {total_rooms}{' '}
                {total_rooms > 1 ? localizedWords.entries.Lcz_Rooms : localizedWords.entries.Lcz_Room}
              </p>
            </div>
            <p class=" text-right text-xs text-gray-500">{booking_store.tax_statement?.message}</p>
          </section>
          <section class={'space-y-14'}>
            {Object.keys(booking_store.ratePlanSelections).map(roomTypeId => {
              return Object.keys(booking_store.ratePlanSelections[roomTypeId]).map(ratePlanId => {
                const r: IRatePlanSelection = booking_store.ratePlanSelections[roomTypeId][ratePlanId];
                if (r.reserved === 0) {
                  return null;
                }
                return [...new Array(r.reserved)].map((_, index) => {
                  if (this.isLoading === r.ratePlan.id) {
                    return <div class="h-16 animate-pulse rounded-md bg-gray-200"></div>;
                  }
                  return (
                    <div class="flex items-center justify-between">
                      <div class="flex-1 space-y-2">
                        <div>
                          <div class="flex items-center gap-3">
                            <div class="flex flex-row items-center gap-3 ">
                              <h3 class="font-semibold">{r.roomtype.name}</h3>
                              {r.ratePlan.is_non_refundable ? (
                                <p class="text-xs text-[var(--ir-green)]">{localizedWords.entries.Lcz_NonRefundable}</p>
                              ) : (
                                <div class={'inline-flex  h-6 items-center justify-center pt-0.5'}>
                                  <ir-button
                                    haveRightIcon
                                    variants="link"
                                    class="text-sm"
                                    buttonClassName="pl-0"
                                    buttonStyles={{ paddingLeft: '0', fontSize: '12px', paddingTop: '0', paddingBottom: '0' }}
                                    onButtonClick={async () => {
                                      this.currentRatePlan = r.ratePlan;
                                      await this.fetchCancelationMessage(r.ratePlan.id, r.roomtype.id);
                                      this.dialogRef.openModal();
                                    }}
                                    label={localizedWords.entries.Lcz_IfICancel}
                                  >
                                    <ir-icons svgClassName="size-4" slot="right-icon" name="circle_info" />
                                  </ir-button>
                                </div>
                              )}
                            </div>
                            <div class="ml-1 flex-1 ">
                              <p class="text-end text-base font-medium xl:text-xl">{formatAmount(r.checkoutVariations[index].amount, app_store.userPreferences.currency_id)}</p>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-2.5">
                          <ir-input
                            onInput={e => {
                              if (index === 0 && !checkout_store.modifiedGuestName && this.firstRoom.ratePlanId === ratePlanId && this.firstRoom.roomtypeId === roomTypeId) {
                                checkout_store.modifiedGuestName = true;
                              }
                              this.handleGuestNameChange(index, e, Number(ratePlanId), Number(roomTypeId));
                            }}
                            value={r.guestName[index]}
                            label={localizedWords.entries.Lcz_GuestFullName}
                            leftIcon
                            class="w-full"
                            placeholder=""
                            maxlength={50}
                            error={this.errors && r.guestName[index] === ''}
                            onInputBlur={e => {
                              if (!checkout_store.modifiedGuestName) {
                                return;
                              }
                              const target = e.target as HTMLIrInputElement;
                              if (r.guestName[index].length < 2) {
                                target.setAttribute('data-state', 'error');
                                target.setAttribute('aria-invalid', 'true');
                              } else {
                                if (target.hasAttribute('aria-invalid')) {
                                  target.setAttribute('aria-invalid', 'false');
                                }
                              }
                            }}
                            onInputFocus={e => {
                              const target = e.target as HTMLIrInputElement;
                              if (target.hasAttribute('data-state')) {
                                target.removeAttribute('data-state');
                              }
                            }}
                          >
                            <ir-icons name="user" slot="left-icon" svgClassName="size-4"></ir-icons>
                          </ir-input>
                          <ir-select
                            variant="double-line"
                            value={r.ratePlan.variations.findIndex(v => v.adult_child_offering === r.checkoutVariations[index].adult_child_offering).toString()}
                            label={localizedWords.entries.Lcz_RequiredCapacity}
                            data={r.ratePlan.variations.map((v, i) => ({
                              id: i.toString(),
                              value: v.adult_child_offering,
                            }))}
                            class="hidden w-full sm:block"
                            onValueChange={e => this.handleVariationChange(index, e, r.ratePlan.variations, Number(ratePlanId), Number(roomTypeId))}
                          ></ir-select>
                        </div>
                        <div class="flex items-center gap-4">
                          <div class="flex items-center gap-1 text-xs">
                            <ir-icons name="utencils" svgClassName="size-4"></ir-icons>
                            <p class="line-clamp-3">
                              <span>{r.ratePlan.short_name}</span>
                              {r.ratePlan.custom_text && <span class="mx-1 max-w-[60%] text-right text-xs text-gray-500 md:w-full md:max-w-full">{r.ratePlan.custom_text}</span>}
                            </p>
                          </div>

                          {this.renderSmokingView(r.roomtype.smoking_option, index, ratePlanId, roomTypeId, r.checkoutSmokingSelection)}

                          {r.is_bed_configuration_enabled && (
                            <ir-select
                              value={r.checkoutBedSelection[index]}
                              onValueChange={e => this.handleBedConfiguration(roomTypeId, ratePlanId, e.detail, index)}
                              data={r.roomtype.bedding_setup.map(b => ({ id: b.code, value: b.name }))}
                              icon
                            >
                              <ir-icons name={r.checkoutBedSelection[index] === 'kingsizebed' ? 'double_bed' : 'bed'} slot="icon"></ir-icons>
                            </ir-select>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              });
            })}
          </section>
        </div>
        <ir-dialog
          ref={el => (this.dialogRef = el)}
          onOpenChange={e => {
            if (!e.detail) {
              this.currentRatePlan = null;
            }
          }}
        >
          <div slot="modal-body" class="p-6 ">
            <p class={'px-6'} innerHTML={this.cancelationMessage || this.currentRatePlan?.cancelation}></p>
            <p class={'px-6'} innerHTML={this.currentRatePlan?.guarantee}></p>
          </div>
        </ir-dialog>
      </Host>
    );
  }
  calculateTotalPersons() {
    let count = 0;
    Object.keys(booking_store.ratePlanSelections).map(roomTypeId => {
      return Object.keys(booking_store.ratePlanSelections[roomTypeId]).map(ratePlanId => {
        const r: IRatePlanSelection = booking_store.ratePlanSelections[roomTypeId][ratePlanId];
        if (r.reserved !== 0) {
          count += r.selected_variation.variation.adult_nbr + r.selected_variation.variation.child_nbr;
        }
      });
    });
    return count;
  }
}
