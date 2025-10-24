import { ISmokingOption, RatePlan } from '@/models/property';
import { PaymentService } from '@/services/api/payment.service';
import VariationService from '@/services/app/variation.service';
// import { PropertyService } from '@/services/api/property.service';
import app_store from '@/stores/app.store';
import booking_store, { calculateTotalRooms, getPrepaymentAmount, IRatePlanSelection } from '@/stores/booking';
import { checkout_store, onCheckoutDataChange } from '@/stores/checkout.store';
import localizedWords from '@/stores/localization.store';
import { formatAmount, getDateDifference } from '@/utils/utils';
import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'ir-booking-details',
  styleUrl: 'ir-booking-details.css',
  shadow: true,
})
export class IrBookingDetails {
  @Prop() errors: string;
  @State() currentRatePlan: RatePlan | null = null;
  @State() isLoading: number = null;
  @State() cancellationMessage: string;
  @State() prepaymentAmount: number = 0;

  // private dialogRef: HTMLIrDialogElement;
  private firstRoom: { roomtypeId: string; ratePlanId: string };
  // private propertyService = new PropertyService();
  private paymentService = new PaymentService();
  private variationService = new VariationService();
  private total_rooms: number;
  private totalPersons: number;

  @Event() prepaymentChange: EventEmitter<number>;

  componentWillLoad() {
    this.total_rooms = calculateTotalRooms();
    this.totalPersons = this.getTotalPersons();
    this.modifyBookings();
    onCheckoutDataChange('userFormData', newValue => {
      if (!checkout_store.modifiedGuestName) {
        this.updateGuestNames(newValue.bookingForSomeoneElse, newValue?.firstName, newValue?.lastName);
      }
    });
  }

  private calculatePrepaymentAmount() {
    this.prepaymentChange.emit(getPrepaymentAmount());
  }

  private getTotalPersons() {
    const { adult_nbr, child_nbr } = booking_store.bookingAvailabilityParams;
    return Number(adult_nbr) + Number(child_nbr);
  }
  private modifyBookings() {
    try {
      // let isInfantNumberSet = false;
      const result: any = {};
      // const totalPersons = this.getTotalPersons();
      // const setInfantNumber = (child_nbr: number, adult_nbr: number) => {
      //   if (isInfantNumberSet||child_nbr === 0 || this.total_rooms > 1 || totalPersons > child_nbr + adult_nbr) {
      //     return -1;
      //   }
      //   isInfantNumberSet = true;
      //   console.log(adult_nbr)
      //   return Math.min(
      //     booking_store.childrenAges.reduce((prev, cur) => {
      //       if (Number(cur) < app_store.childrenStartAge) {
      //         return prev + 1;
      //       }
      //       return prev;
      //     }, 0),
      //     child_nbr,
      //   );
      // };
      const setInfantNumber = (child_nbr: number) => {
        return Math.min(
          booking_store.childrenAges.reduce((prev, cur) => {
            if (Number(cur) < app_store.childrenStartAge) {
              return prev + 1;
            }
            return prev;
          }, 0),
          child_nbr,
        );
      };
      for (const roomtypeId in booking_store.ratePlanSelections) {
        if (booking_store.ratePlanSelections.hasOwnProperty(roomtypeId)) {
          const roomtype = booking_store.ratePlanSelections[roomtypeId];
          result[roomtypeId] = {};
          for (const ratePlanId in roomtype) {
            if (roomtype.hasOwnProperty(ratePlanId)) {
              const ratePlan = roomtype[ratePlanId];
              if (ratePlan.reserved === 0) {
                result[roomtypeId][ratePlanId] = ratePlan;
              } else {
                if (!this.firstRoom) {
                  this.firstRoom = {
                    roomtypeId,
                    ratePlanId,
                  };
                }
                result[roomtypeId][ratePlanId] = {
                  ...ratePlan,
                  checkoutVariations: Array(ratePlan.reserved).fill(ratePlan.selected_variation),
                  checkoutBedSelection: ratePlan.is_bed_configuration_enabled ? Array(ratePlan.reserved).fill('-1') : [],
                  checkoutSmokingSelection: Array(ratePlan.reserved).fill(ratePlan.roomtype.smoking_option[0]),
                  // infant_nbr: Array(ratePlan.reserved).fill(
                  //   ratePlan.selected_variation.child_nbr > 0 ? setInfantNumber(ratePlan.selected_variation.child_nbr, ratePlan.selected_variation.adult_nbr) : 0,
                  // ),
                  infant_nbr: Array(ratePlan.reserved).fill(ratePlan.selected_variation.child_nbr > 0 ? setInfantNumber(ratePlan.selected_variation.child_nbr) : 0),
                };
              }
              if (!checkout_store.modifiedGuestName && ratePlan.guestName?.length === 0) {
                const name = [...new Array(ratePlan.reserved)].map((_, i) => {
                  if (i === 0 && !checkout_store.userFormData.bookingForSomeoneElse && this.firstRoom.roomtypeId === roomtypeId && this.firstRoom.ratePlanId === ratePlanId) {
                    return (checkout_store.userFormData?.firstName || '') + ' ' + (checkout_store.userFormData?.lastName || '') || '';
                  }
                  return '';
                });
                result[roomtypeId][ratePlanId] = {
                  ...result[roomtypeId][ratePlanId],
                  guestName: name,
                };
              }
            }
          }
        }
      }
      booking_store.ratePlanSelections = { ...result };
      this.calculatePrepaymentAmount();
    } catch (error) {
      console.error('modify Booking error', error);
    }
  }

  private updateGuestNames(isBookingForSomeoneElse: boolean, firstName: string, lastName: string) {
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

  private handleGuestNameChange(index: number, e: InputEvent, rateplanId: number, roomTypeId: number): void {
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

  private handleBedConfiguration(roomTypeId: string, rateplanId: string, detail: string | number, index: number): void {
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

  private handleSmokeConfiguration(roomTypeId: string, rateplanId: string, detail: string | number, index: number): void {
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

  private async fetchCancellationMessage(applicable_policies) {
    this.cancellationMessage = this.paymentService.getCancellationMessage(applicable_policies, true)?.message;
  }
  private renderSmokingView(smoking_option: ISmokingOption, index: number, ratePlanId: string, roomTypeId: string, checkoutSmokingSelection: string[]) {
    if (smoking_option.code === '002') {
      return null;
    }
    if (smoking_option.code === '003') {
      return (
        <div class="ir-booking-details__footer-text">
          <ir-icons name={'ban_smoking'} removeClassName height={16} width={16}></ir-icons>
          <p>{smoking_option.description}</p>
        </div>
      );
    }
    return (
      <ir-select
        icon
        style={{ '--radius': '1rem' }}
        onValueChange={e => this.handleSmokeConfiguration(roomTypeId, ratePlanId, e.detail, index)}
        value={checkoutSmokingSelection[index]}
        data={smoking_option.allowed_smoking_options.map(s => ({ id: s.code, value: s.description }))}
        class="ir-booking-details__smoking-select"
      >
        <ir-icons name={checkoutSmokingSelection[index] !== '002' ? 'smoking' : 'ban_smoking'} slot="icon" removeClassName height={16} width={16}></ir-icons>
      </ir-select>
    );
  }
  private handleInfantNumberChange(roomTypeId: string, rateplanId: string, detail: string | number, index: number): void {
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
          infant_nbr: (() => {
            const infants = [...booking_store.ratePlanSelections[roomTypeId][rateplanId].infant_nbr];
            infants[index] = Number(detail);
            return infants;
          })(),
        },
      },
    };
    this.calculatePrepaymentAmount();
  }
  private calculateTotalPersons() {
    let count = 0;
    Object.keys(booking_store.ratePlanSelections).map(roomTypeId => {
      return Object.keys(booking_store.ratePlanSelections[roomTypeId]).map(ratePlanId => {
        const r: IRatePlanSelection = booking_store.ratePlanSelections[roomTypeId][ratePlanId];
        if (r.reserved !== 0) {
          count += r.selected_variation.adult_nbr + r.selected_variation.child_nbr;
        }
      });
    });
    return count;
  }
  render() {
    const total_nights = getDateDifference(booking_store.bookingAvailabilityParams.from_date, booking_store.bookingAvailabilityParams.to_date);
    // const this.total_rooms = calculateTotalRooms();
    const total_persons = this.calculateTotalPersons();
    return (
      <Host>
        <div class="ir-booking-details__container">
          <section class="ir-booking-details__summary">
            <div class="ir-booking-details__summary-row">
              <ir-icons name="bed" removeClassName height={20} width={20}></ir-icons>
              <p>
                {total_nights} {total_nights > 1 ? localizedWords.entries.Lcz_Nights : localizedWords.entries.Lcz_night} - {total_persons}{' '}
                {total_persons > 1 ? localizedWords.entries.Lcz_Persons : localizedWords.entries.Lcz_Person} - {this.total_rooms}{' '}
                {this.total_rooms > 1 ? localizedWords.entries.Lcz_Rooms : localizedWords.entries.Lcz_Room}
              </p>
            </div>
            <p class="ir-booking-details__summary-note">{booking_store.tax_statement?.message}</p>
          </section>
          <section class="ir-booking-details__rooms">
            {Object.keys(booking_store?.ratePlanSelections)?.map(roomTypeId => {
              return Object.keys(booking_store.ratePlanSelections[roomTypeId]).map(ratePlanId => {
                const r: IRatePlanSelection = booking_store.ratePlanSelections[roomTypeId][ratePlanId];
                if (r.reserved === 0) {
                  return null;
                }
                return [...new Array(r.reserved)].map((_, index) => {
                  if (this.isLoading === r.ratePlan.id) {
                    return <div class="ir-booking-details__room-loading"></div>;
                  }
                  const { amount, gross } = this.variationService.calculateVariationAmount({
                    baseVariation: r.checkoutVariations[index],
                    variations: r.ratePlan.variations,
                    infants: r.infant_nbr[index],
                  });
                  const isInFreeCancellationZone = this.paymentService.checkFreeCancellationZone(r.checkoutVariations[index]?.applicable_policies);

                  return (
                    <div class="ir-booking-details__room-block">
                      <div class="ir-booking-details__room">
                        <div class="ir-booking-details__room-content">
                          <div>
                            <div class="ir-booking-details__room-header">
                              <div class="ir-booking-details__room-title">
                                <h3 class="ir-booking-details__room-name">{r.roomtype.name}</h3>
                                {r.ratePlan.is_non_refundable ? (
                                  <p class="ir-booking-details__badge">{localizedWords.entries.Lcz_NonRefundable}</p>
                                ) : (
                                  <div class="ir-booking-details__policy-container">
                                    {/* <ir-button
                                      haveRightIcon
                                      variants="link"
                                      class="ir-booking-details__policy-button"
                                      buttonClassName="ir-booking-details__policy-button-inner"
                                      buttonStyles={{ paddingLeft: '0', fontSize: '12px', paddingTop: '0', paddingBottom: '0', color: '#227950' }}
                                      onButtonClick={async () => {
                                        this.currentRatePlan = r.ratePlan;
                                        await this.fetchCancellationMessage(r.checkoutVariations[index].applicable_policies);
                                        this.dialogRef.openModal();
                                      }}
                                      label={isInFreeCancellationZone ? localizedWords.entries.Lcz_FreeCancellation : localizedWords.entries.Lcz_IfICancel}
                                    >
                                      <ir-icons slot="right-icon" name="circle_info" removeClassName height={16} width={16} style={{ color: '#98a2b3' }} />
                                    </ir-button> */}
                                    <ir-tooltip
                                      labelColors={isInFreeCancellationZone ? 'green' : 'default'}
                                      class={`rateplan-tooltip`}
                                      style={{ color: '#98a2b3' }}
                                      open_behavior="hover"
                                      label={isInFreeCancellationZone ? localizedWords.entries.Lcz_FreeCancellation : localizedWords.entries.Lcz_IfICancel}
                                      message={this.cancellationMessage}
                                      onTooltipOpenChange={async e => {
                                        if (e.detail) {
                                          this.currentRatePlan = r.ratePlan;
                                          await this.fetchCancellationMessage(r.checkoutVariations[index].applicable_policies);
                                        }
                                      }}
                                    ></ir-tooltip>
                                  </div>
                                )}
                              </div>
                              {/* <div class="ir-booking-details__price-wrapper">
                              <p class="ir-booking-details__price" style={{ fontWeight: gross > amount ? '400' : '700' }}>
                                {formatAmount(amount, app_store.userPreferences.currency_id)}
                              </p>
                              {gross > amount && (
                                <p class="ir-booking-details__price ir-booking-details__price--gross">{formatAmount(gross, app_store.userPreferences.currency_id)}</p>
                              )}
                            </div> */}
                            </div>
                          </div>
                          <div class="ir-booking-details__rate-info">
                            <div class="ir-booking-details__rate-description">
                              <ir-icons name="utencils" removeClassName height={16} width={16}></ir-icons>
                              <p class="ir-booking-details__rate-text">
                                <span>{r.ratePlan.short_name}</span>
                              </p>
                            </div>
                            {r.ratePlan.custom_text && (
                              <span class="ir-booking-details__rate-custom-text" title={r.ratePlan.custom_text}>
                                {r.ratePlan.custom_text}
                              </span>
                            )}
                            {/* {gross > amount && <p class="ir-booking-details__tax-note">{localizedWords.entries.Lcz_IncludingTaxesAndFees}</p>} */}
                          </div>
                        </div>
                        <div class="ir-booking-details__price-wrapper">
                          <p class="ir-booking-details__price" style={{ fontWeight: gross > amount ? '400' : '700' }}>
                            {formatAmount(amount, app_store.userPreferences.currency_id)}
                          </p>
                          {gross > amount && <p class="ir-booking-details__price ir-booking-details__price--gross">{formatAmount(gross, app_store.userPreferences.currency_id)}</p>}
                          {gross > amount && <p class="ir-booking-details__tax-note">{localizedWords.entries.Lcz_IncludingTaxesAndFees}</p>}
                        </div>
                      </div>
                      <div class="ir-booking-details__guest-row">
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
                          class="ir-booking-details__guest-input"
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
                          <ir-icons name="user" slot="left-icon" removeClassName height={16} width={16}></ir-icons>
                        </ir-input>
                        {/* <ir-select
                            variant="double-line"
                            value={r.ratePlan.variations
                              .findIndex(v => `${v.adult_nbr}_a_${v.child_nbr}_c` === `${r.checkoutVariations[index].adult_nbr}_a_${r.checkoutVariations[index].child_nbr}_c`)
                              .toString()}
                            label={localizedWords.entries.Lcz_RequiredCapacity}
                            data={r.ratePlan.variations.map((v, i) => ({
                              id: i.toString(),
                              value: this.formatVariation(v),
                            }))}
                            class="ir-booking-details__guest-input"
                            onValueChange={e => {
                              this.handleVariationChange(index, e, r.ratePlan.variations, Number(ratePlanId), Number(roomTypeId));
                            }}
                          ></ir-select> */}
                        <p
                          class="ir-booking-details__capacity"
                          innerHTML={this.variationService.formatVariationBasedOnInfants({
                            baseVariation: r.checkoutVariations[index],
                            variations: r.ratePlan.variations,
                            infants: r.infant_nbr[index],
                          })}
                        ></p>
                      </div>

                      {/* Infants row */}
                      {r.selected_variation.child_nbr > 0 &&
                        booking_store.childrenAges.some(age => Number(age) < app_store.childrenStartAge) &&
                        (this.totalPersons > r.checkoutVariations[index].adult_nbr + r.checkoutVariations[index].child_nbr || this.total_rooms > 1) && (
                          <div class="ir-booking-details__infant-row">
                            <div class="ir-booking-details__infant-label">
                              <ir-icons name="baby" removeClassName height={16} width={16}></ir-icons>
                              <p class="ir-booking-details__infant-text">{localizedWords.entries?.Lcz_AnyInfant}</p>
                            </div>

                            <ir-select
                              style={{ '--radius': '1rem' }}
                              data-state={this.errors && Number(r.infant_nbr) === -1 ? 'error' : ''}
                              class="ir-booking-details__infant-select"
                              value={r.infant_nbr[index]}
                              onValueChange={e => this.handleInfantNumberChange(roomTypeId, ratePlanId, e.detail, index)}
                              data={[
                                { id: -1, value: '...' },
                                { id: 0, value: localizedWords.entries?.Lcz_No },
                                ...[...Array(Math.min(r.selected_variation.child_nbr, 3))].map((_, i) => ({ id: i + 1, value: (i + 1).toString() })),
                              ]}
                            ></ir-select>
                          </div>
                        )}

                      <div class="ir-booking-details__options-row">
                        {this.renderSmokingView(r.roomtype.smoking_option, index, ratePlanId, roomTypeId, r.checkoutSmokingSelection)}
                        {r.is_bed_configuration_enabled && app_store.setup_entries?.bedPreferenceType.length > 0 && (
                          <ir-select
                            style={{ '--radius': '1rem' }}
                            data-state={this.errors && r.checkoutBedSelection[index] === '-1' ? 'error' : ''}
                            value={r.checkoutBedSelection[index]}
                            onValueChange={e => this.handleBedConfiguration(roomTypeId, ratePlanId, e.detail, index)}
                            data={[
                              { id: '-1', value: `${localizedWords.entries.Lcz_Bedconfiguration}...` },
                              ...app_store.setup_entries?.bedPreferenceType?.map(b => ({
                                id: b.CODE_NAME,
                                value: b[`CODE_VALUE_${(app_store.userPreferences.language_id ?? 'en').toUpperCase()}`],
                              })),
                            ]}
                            class="ir-booking-details__bed-select"
                            icon
                          >
                            <ir-icons name={r.checkoutBedSelection[index] === 'kingsizebed' ? 'double_bed' : 'bed'} slot="icon" removeClassName height={16} width={16}></ir-icons>
                          </ir-select>
                        )}
                      </div>
                    </div>
                  );
                });
              });
            })}
          </section>
        </div>
        {/* <ir-dialog
          // ref={el => (this.dialogRef = el)}
          onOpenChange={e => {
            if (!e.detail) {
              this.currentRatePlan = null;
            }
          }}
        >
          <div slot="modal-body" class="ir-booking-details__dialog-body">
            <p class="ir-booking-details__dialog-text" innerHTML={this.cancellationMessage || this.currentRatePlan?.cancelation}></p>
            <p class="ir-booking-details__dialog-text" innerHTML={this.currentRatePlan?.guarantee}></p>
          </div>
        </ir-dialog> */}
      </Host>
    );
  }
}
