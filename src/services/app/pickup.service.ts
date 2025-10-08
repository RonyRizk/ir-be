import axios from 'axios';
import { renderTime } from '@/utils/utils';
import { TPickupFormData } from '@/models/pickup';
import app_store from '@/stores/app.store';
import booking_store, { IRatePlanSelection } from '@/stores/booking';

export class PickupService {
  public calculateTotalPersons() {
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
  public async savePickup(params: TPickupFormData, booking_nbr: string, is_remove: boolean) {
    try {
      const splitTime = params.arrival_time.split(':');
      await axios.post(`/Do_Pickup?Ticket=${app_store.app_data.token}`, {
        booking_nbr,
        is_remove,
        currency: params.currency,
        date: params.arrival_date,
        details: params.flight_details,
        hour: splitTime[0],
        minute: splitTime[1],
        nbr_of_units: params.number_of_vehicles,
        selected_option: params.selected_option,
        total: +params.due_upon_booking,
      });
    } catch (error) {
      console.log(error);
    }
  }

  public transformDefaultPickupData(data: any) {
    const arrival_time = renderTime(data.hour) + ':' + renderTime(data.minute);
    return {
      arrival_date: data.date,
      arrival_time,
      currency: data.currency,
      due_upon_booking: data.total.toFixed(2),
      flight_details: data.details,
      location: data.selected_option.location.id,
      number_of_vehicles: data.nbr_of_units,
      selected_option: data.selected_option,
      vehicle_type_code: data.selected_option.vehicle.code,
    };
  }
  public getAvailableLocations(message: string): Array<{ id: number; value: string }> {
    let locationsMap = new Map<number, { id: number; value: string }>();
    app_store.property.pickup_service.allowed_options?.forEach(option => {
      if (!locationsMap.has(option.location.id)) {
        locationsMap.set(option.location.id, {
          value: message.replace('%1', option.location.description),
          id: option.location.id,
        });
      }
    });
    return Array.from(locationsMap.values());
  }

  // public getNumberOfVehicles(capacity: number, numberOfPersons: number) {
  //   let total_number_of_vehicles = Math.ceil(numberOfPersons / capacity);
  //   // let startNumber = total_number_of_vehicles > 1 ? total_number_of_vehicles : 1;
  //   // let bonus_number = total_number_of_vehicles > 1 ? 2 : 3;
  //   return Array.from({ length: total_number_of_vehicles}, (_, i) => 1 + i);
  // }
  public getNumberOfVehicles(capacity: number, numberOfPersons: number) {
    const total_number_of_vehicles = Math.ceil(numberOfPersons / capacity);
    const maxVehicles = Math.min(total_number_of_vehicles, numberOfPersons);
    const minVehicles = 1;

    return Array.from({ length: maxVehicles - minVehicles + 1 }, (_, i) => minVehicles + i);
  }
  private getPickUpPersonStatus(code: string) {
    const getCodeDescription = app_store.property.pickup_service.allowed_pricing_models.find(model => model.code === code);
    if (!getCodeDescription) {
      return null;
    }
    return getCodeDescription.description;
  }
  public updateDue(params: any) {
    const getCodeDescription = this.getPickUpPersonStatus(params.code);
    if (!getCodeDescription) {
      return;
    }
    if (getCodeDescription === 'Person') {
      return params.amount * params.numberOfPersons;
    } else {
      return params.amount * params.number_of_vehicles;
    }
  }
}
