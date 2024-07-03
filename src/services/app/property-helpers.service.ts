import { DataStructure } from '@/models/common';
import { TPickupFormData } from '@/models/pickup';
import { RoomType } from '@/models/property';
import { MissingTokenError } from '@/models/Token';
import booking_store from '@/stores/booking';
import axios from 'axios';
import { addDays, format } from 'date-fns';

export class PropertyHelpers {
  private static readonly MODE_MODIFY_RT = 'modify_rt';
  private static readonly MODE_DEFAULT = 'default';

  public validateModeProps(props: any) {
    if (props.mode === PropertyHelpers.MODE_MODIFY_RT && (!props.rp_id || !props.rt_id)) {
      throw new Error('Missing property: rp_id or rt_id is required in modify_rt mode');
    }
  }
  public convertPickup(pickup: TPickupFormData) {
    let res: any = {};
    const [hour, minute] = pickup.arrival_time.split(':');
    res = {
      booking_nbr: null,
      is_remove: false,
      currency: pickup.currency,
      date: pickup.arrival_date,
      details: pickup.flight_details || null,
      hour: Number(hour),
      minute: Number(minute),
      nbr_of_units: pickup.number_of_vehicles,
      selected_option: pickup.selected_option,
      total: Number(pickup.due_upon_booking),
    };
    return res;
  }
  public updateBookingStore(data: any, props: any) {
    try {
      let roomtypes = [...booking_store.roomTypes];
      const newRoomtypes = data.My_Result.roomtypes;
      if (props.mode === PropertyHelpers.MODE_DEFAULT) {
        roomtypes = this.updateInventory(roomtypes, newRoomtypes);
        roomtypes = this.sortRoomTypes(roomtypes, {
          adult_nbr: props.params.adult_nbr,
          child_nbr: props.params.child_nbr,
        });
      } else {
        roomtypes = this.updateRoomTypeRatePlans(roomtypes, newRoomtypes, props);
      }
      booking_store.roomTypes = roomtypes;
      booking_store.tax_statement = { message: data.My_Result.tax_statement };
      booking_store.enableBooking = true;
    } catch (error) {
      console.error(error);
    }
  }
  public validateToken(token: string | null) {
    if (!token) {
      throw new MissingTokenError();
    }
  }

  public collectRoomTypeIds(props: any): number[] {
    return props.rt_id ? [props.rt_id] : [];
  }

  public collectRatePlanIds(props: any): number[] {
    return props.rp_id ? [props.rp_id] : [];
  }
  public generateDays(from_date: Date, to_date: Date, amount: number) {
    const endDate = to_date;
    let currentDate = from_date;
    const days: {
      date: string;
      amount: number;
      cost: null;
    }[] = [];

    while (currentDate < endDate) {
      days.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        amount: amount,
        cost: null,
      });
      currentDate = addDays(currentDate, 1);
    }
    return days;
  }

  public extractFirstNameAndLastName(index: number, guestName: string[]) {
    const names = guestName[index].split(' ');
    return { first_name: names[0] || null, last_name: names[1] || null };
  }
  public async fetchAvailabilityData(token: string, props: any, roomtypeIds: number[], rateplanIds: number[]): Promise<any> {
    const response = await axios.post(`/Get_Exposed_Booking_Availability?Ticket=${token}`, {
      ...props.params,
      identifier: props.identifier,
      room_type_ids: roomtypeIds,
      rate_plan_ids: rateplanIds,
      skip_getting_assignable_units: true,
      is_specific_variation: true,
    });
    const result = response.data as DataStructure;
    if (result.ExceptionMsg !== '') {
      throw new Error(result.ExceptionMsg);
    }
    return result;
  }
  private updateInventory(roomtypes: RoomType[], newRoomtypes: RoomType[]): RoomType[] {
    const newRoomtypesMap = new Map(newRoomtypes.map(rt => [rt.id, rt]));
    return roomtypes.reduce((updatedRoomtypes, rt) => {
      const newRoomtype = newRoomtypesMap.get(rt.id);
      if (!newRoomtype) {
        return updatedRoomtypes;
      }
      const updatedRoomtype = {
        ...rt,
        inventory: newRoomtype.inventory,
        rateplans: rt.rateplans.reduce((updatedRatePlans, rp) => {
          const newRatePlan = newRoomtype.rateplans.find(newRP => newRP.id === rp.id);
          if (!newRatePlan || !newRatePlan.is_active || !newRatePlan.is_booking_engine_enabled) {
            return updatedRatePlans;
          }
          console.log(rp.variations);
          updatedRatePlans.push({
            ...newRatePlan,
            variations: rp.variations,
            selected_variation: newRatePlan.variations ? newRatePlan.variations[0] : null,
          });
          return updatedRatePlans;
        }, []),
      };
      updatedRoomtypes.push(updatedRoomtype);
      return updatedRoomtypes;
    }, []);
  }

  private sortRoomTypes(roomTypes: RoomType[], userCriteria: { adult_nbr: number; child_nbr: number }): RoomType[] {
    return roomTypes.sort((a, b) => {
      // Move room types with zero inventory to the end
      if (a.inventory === 0 && b.inventory !== 0) return 1;
      if (a.inventory !== 0 && b.inventory === 0) return -1;

      // Check for variations where is_calculated is true and amount is 0
      const zeroCalculatedA = a.rateplans.some(plan => plan.variations.some(variation => variation.is_calculated && (variation.amount === 0 || variation.amount === null)));
      const zeroCalculatedB = b.rateplans.some(plan => plan.variations.some(variation => variation.is_calculated && (variation.amount === 0 || variation.amount === null)));

      // Prioritize these types to be before inventory 0 but after all others
      if (zeroCalculatedA && !zeroCalculatedB) return 1;
      if (!zeroCalculatedA && zeroCalculatedB) return -1;

      // Check for exact matching variations
      const matchA = a.rateplans.some(plan => plan.variations.some(variation => variation.adult_nbr === userCriteria.adult_nbr && variation.child_nbr === userCriteria.child_nbr));
      const matchB = b.rateplans.some(plan => plan.variations.some(variation => variation.adult_nbr === userCriteria.adult_nbr && variation.child_nbr === userCriteria.child_nbr));

      if (matchA && !matchB) return -1;
      if (!matchA && matchB) return 1;

      // Sort by the highest variation in any attribute, for example `amount`
      const maxVariationA = Math.max(...a.rateplans.flatMap(plan => plan.variations.map(variation => variation.amount)));
      const maxVariationB = Math.max(...b.rateplans.flatMap(plan => plan.variations.map(variation => variation.amount)));

      if (maxVariationA < maxVariationB) return -1;
      if (maxVariationA > maxVariationB) return 1;

      return 0;
    });
  }

  private updateRoomTypeRatePlans(roomtypes: RoomType[], newRoomtypes: RoomType[], props: any) {
    const selectedRoomTypeIdx = roomtypes.findIndex(rt => rt.id === props.rt_id);
    if (selectedRoomTypeIdx === -1) {
      throw new Error('Invalid RoomType');
    }
    const selectednewRoomTypeIdx = newRoomtypes.findIndex(rt => rt.id === props.rt_id);
    if (selectedRoomTypeIdx === -1) {
      throw new Error('Invalid RoomType');
    }
    if (selectednewRoomTypeIdx === -1) {
      throw new Error('Invalid New RoomType');
    }
    const newRatePlan = newRoomtypes[selectednewRoomTypeIdx].rateplans?.find(rp => rp.id === props.rp_id);
    if (!newRatePlan) {
      throw new Error('Invalid New Rateplan');
    }
    const newVariation = newRatePlan.variations.find(v => v.adult_child_offering === props.adultChildConstraint);
    console.log(newRatePlan.variations, props.adultChildConstraint);
    if (!newVariation) {
      throw new Error('Missing variation');
    }
    roomtypes[selectedRoomTypeIdx] = {
      ...roomtypes[selectedRoomTypeIdx],
      rateplans: roomtypes[selectedRoomTypeIdx].rateplans.map(rp => {
        return {
          ...rp,
          variations: rp.variations.map(v => {
            if (v.adult_child_offering === props.adultChildConstraint && rp.id === props.rp_id) {
              return newVariation;
            }
            return v;
          }),
        };
      }),
    };
    return roomtypes;
  }
}
