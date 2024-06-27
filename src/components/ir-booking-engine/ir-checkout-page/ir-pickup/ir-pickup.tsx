import { PickupFormData, TAllowedOptions } from '@/models/pickup';
import { PickupService } from '@/services/app/pickup.service';
import app_store, { onAppDataChange } from '@/stores/app.store';
import { checkout_store, onCheckoutDataChange, updatePartialPickupFormData, updatePickupFormData } from '@/stores/checkout.store';
import localizedWords from '@/stores/localization.store';
import { formatAmount } from '@/utils/utils';
import { Component, h, Element, State, Listen, Prop } from '@stencil/core';
import { format } from 'date-fns';
import IMask from 'imask';
import { ZodIssue } from 'zod';
@Component({
  tag: 'ir-pickup',
  styleUrl: 'ir-pickup.css',
  shadow: true,
})
export class IrPickup {
  @Prop() errors: Record<string, ZodIssue>;
  @State() vehicleCapacity: number[] = [];
  @State() allowedOptionsByLocation: TAllowedOptions[] = [];

  @Element() el: HTMLIrPickupElement;

  private popover: HTMLIrPopoverElement;
  private pickupService = new PickupService();
  private time_mask = {
    mask: 'HH:MM',
    blocks: {
      HH: {
        mask: IMask.MaskedRange,
        from: 0,
        to: 23,
        maxLength: 2,
        placeholderChar: 'H',
      },
      MM: {
        mask: IMask.MaskedRange,
        from: 0,
        to: 59,
        maxLength: 2,
        placeholderChar: 'M',
      },
    },
    lazy: false,
    placeholderChar: '_',
  };
  private oldCurrencyValue: string;
  componentWillLoad() {
    this.oldCurrencyValue = app_store.userPreferences.currency_id;
    this.updateCurrency();
    onAppDataChange('userPreferences', newValue => {
      if (newValue.currency_id !== this.oldCurrencyValue) {
        this.updateCurrency();
      }
    });

    if (checkout_store.pickup.location) {
      this.vehicleCapacity = this.pickupService.getNumberOfVehicles(checkout_store.pickup.selected_option.vehicle.capacity, 3);
      this.allowedOptionsByLocation = app_store.property.pickup_service.allowed_options.filter(
        option => option.location.id.toString() === checkout_store.pickup.location.toString(),
      );
    }
    onCheckoutDataChange('pickup', newValue => {
      if (newValue.location) {
        this.vehicleCapacity = this.pickupService.getNumberOfVehicles(newValue.selected_option.vehicle.capacity, 3);
        this.allowedOptionsByLocation = app_store.property.pickup_service.allowed_options.filter(option => option.location.id.toString() === newValue.location.toString());
      }
    });
  }
  updateCurrency() {
    const currency = app_store.currencies.find(c => c.code === app_store.userPreferences.currency_id);
    updatePickupFormData('currency', currency);
  }
  dateTrigger() {
    return (
      <div class="popover-trigger w-full " slot="trigger">
        <svg xmlns="http://www.w3.org/2000/svg" height="18" width="12.5" viewBox="0 0 448 512">
          <path
            fill="currentColor"
            d="M96 32V64H48C21.5 64 0 85.5 0 112v48H448V112c0-26.5-21.5-48-48-48H352V32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H160V32c0-17.7-14.3-32-32-32S96 14.3 96 32zM448 192H0V464c0 26.5 21.5 48 48 48H400c26.5 0 48-21.5 48-48V192z"
          />
        </svg>
        <div>
          <p class="trigger-label">{localizedWords.entries.Lcz_ArrivalDate}</p>
          <p class={'date'}>{format(new Date(checkout_store.pickup.arrival_date), 'MMM dd, yyyy')}</p>
        </div>
      </div>
    );
  }
  @Listen('dateChange')
  handleChangeDate(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    updatePickupFormData('arrival_date', format(e.detail, 'yyyy-MM-dd'));
    this.popover.toggleVisibility();
  }
  handleVehicleTypeChange(e: CustomEvent) {
    if (e.detail === '') {
      updatePartialPickupFormData({ due_upon_booking: '', vehicle_type_code: '' });
      return;
    }
    let locationChoice = app_store.property.pickup_service.allowed_options.find(
      option => option.location.id === +checkout_store.pickup.location && option.vehicle.code === e.detail,
    );
    if (!locationChoice) {
      return;
    }
    this.vehicleCapacity = [...this.pickupService.getNumberOfVehicles(locationChoice.vehicle.capacity, 3)];
    updatePartialPickupFormData({
      selected_option: locationChoice,
      number_of_vehicles: this.vehicleCapacity[0],
      due_upon_booking: this.pickupService
        .updateDue({
          amount: locationChoice.amount,
          code: locationChoice.pricing_model.code,
          numberOfPersons: 3,
          number_of_vehicles: this.vehicleCapacity[0],
        })
        .toFixed(2),
      vehicle_type_code: locationChoice.vehicle.code,
    });
  }
  handleLocationChange(event: CustomEvent) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const value = event.detail;
    if (value === '-1') {
      updatePickupFormData('location', null);
    }
    if (value !== '-1') {
      this.allowedOptionsByLocation = app_store.property.pickup_service.allowed_options.filter(option => option.location.id.toString() === value);
      let locationChoice = this.allowedOptionsByLocation[0];
      if (!locationChoice) {
        return;
      }
      locationChoice.currency;
      this.vehicleCapacity = this.pickupService.getNumberOfVehicles(locationChoice.vehicle.capacity, 3);
      updatePartialPickupFormData({
        location: value,
        selected_option: locationChoice,
        number_of_vehicles: this.vehicleCapacity[0],
        due_upon_booking: this.pickupService
          .updateDue({
            amount: locationChoice.amount,
            code: locationChoice.pricing_model.code,
            numberOfPersons: 3,
            number_of_vehicles: this.vehicleCapacity[0],
          })
          .toFixed(2),
        vehicle_type_code: locationChoice.vehicle.code,
        currency: locationChoice.currency,
      });
    }
  }
  handleVehicleQuantityChange(e: CustomEvent) {
    if (e.detail === '') {
      return;
    }
    const value = +e.detail;
    updatePartialPickupFormData({
      number_of_vehicles: value,
      due_upon_booking: this.pickupService
        .updateDue({
          amount: checkout_store.pickup.selected_option.amount,
          code: checkout_store.pickup.selected_option.pricing_model.code,
          numberOfPersons: 3,
          number_of_vehicles: value,
        })
        .toFixed(2),
    });
  }
  render() {
    if (!app_store.property.pickup_service.allowed_options) {
      return null;
    }
    return (
      <section class="space-y-5">
        <div class="flex flex-wrap items-center gap-2 rounded-md bg-gray-100 px-4 py-2">
          <ir-icons name="car"></ir-icons>
          <p>{localizedWords.entries.Lcz_NeedPickup}</p>
          <ir-select
            value={checkout_store.pickup?.location}
            onValueChange={this.handleLocationChange.bind(this)}
            data={[{ id: -1, value: localizedWords.entries.Lcz_NoThankYou }, ...(this.pickupService.getAvailableLocations(localizedWords.entries.Lcz_YesFrom) as any)]}
          ></ir-select>
        </div>
        {checkout_store.pickup.location && (
          <div class={'flex items-center  justify-between'}>
            <div class="flex-1 space-y-5">
              <div class={'flex items-center gap-4'}>
                <ir-popover ref={el => (this.popover = el)} class="w-fit">
                  {this.dateTrigger()}
                  <div slot="popover-content" class="date-range-container w-full border-0 p-2 shadow-none sm:w-auto sm:border sm:shadow-sm md:p-4 ">
                    <ir-calendar></ir-calendar>
                  </div>
                </ir-popover>
                <ir-input
                  onTextChanged={e => updatePickupFormData('arrival_time', e.detail)}
                  label={localizedWords.entries.Lcz_ArrivalHour}
                  placeholder="HH:MM"
                  mask={this.time_mask}
                  type="text"
                  id="time-input"
                  onInputBlur={e => {
                    const firstNameSchema = PickupFormData.pick({ arrival_time: true });
                    const firstNameValidation = firstNameSchema.safeParse({ arrival_time: checkout_store.pickup?.arrival_time });
                    const target: HTMLIrInputElement = e.target;
                    if (!firstNameValidation.success) {
                      target.setAttribute('data-state', 'error');
                      target.setAttribute('aria-invalid', 'true');
                    } else {
                      if (target.hasAttribute('aria-invalid')) {
                        target.setAttribute('aria-invalid', 'false');
                      }
                    }
                  }}
                  onInputFocus={e => {
                    const target: HTMLIrInputElement = e.target;
                    if (target.hasAttribute('data-state')) target.removeAttribute('data-state');
                  }}
                />
                <div class="hidden flex-1  md:block">
                  <p class="text-end text-base font-medium xl:text-xl">
                    {formatAmount(checkout_store.pickup.location ? Number(checkout_store.pickup.due_upon_booking) : 0, app_store.userPreferences.currency_id)}
                  </p>
                </div>
              </div>
              <div>
                <ir-input
                  label={localizedWords.entries.Lcz_FlightDetails}
                  placeholder=""
                  value={checkout_store.pickup.flight_details}
                  onTextChanged={e => updatePickupFormData('flight_details', e.detail)}
                ></ir-input>
              </div>
              <div class="flex flex-1 items-center gap-4">
                <ir-select
                  value={checkout_store.pickup.vehicle_type_code}
                  data={this.allowedOptionsByLocation.map(option => ({
                    id: option.vehicle.code,
                    value: option.vehicle.description,
                  }))}
                  onValueChange={this.handleVehicleTypeChange.bind(this)}
                  class="w-full"
                  label={localizedWords.entries.Lcz_CarModel}
                  variant="double-line"
                ></ir-select>
                <ir-select
                  value={checkout_store.pickup.number_of_vehicles}
                  onValueChange={this.handleVehicleQuantityChange.bind(this)}
                  class="w-72"
                  data={this.vehicleCapacity.map(i => ({
                    id: i,
                    value: i.toString(),
                  }))}
                  label={localizedWords.entries.Lcz_NoOfVehicles}
                  variant="double-line"
                ></ir-select>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
}
