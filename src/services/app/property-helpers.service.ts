import { DataStructure } from '@/models/common';
import { TPickupFormData } from '@/models/pickup';
import { RatePlan, RoomType, Variation } from '@/models/property';
import booking_store from '@/stores/booking';
import axios from 'axios';
import { addDays, format } from 'date-fns';

export class PropertyHelpers {
  public convertPickup(pickup: TPickupFormData) {
    let res: any = {};
    const [hour, minute] = pickup.arrival_time.split(':');
    res = {
      booking_nbr: null,
      is_remove: false,
      currency: pickup.currency,
      date: pickup.arrival_date.format('YYYY-MM-DD'),
      details: pickup.flight_details || null,
      hour: Number(hour),
      minute: Number(minute),
      nbr_of_units: pickup.number_of_vehicles,
      selected_option: pickup.selected_option,
      total: Number(pickup.due_upon_booking),
    };
    return res;
  }

  public updateBookingStore(data: any) {
    try {
      const newRoomtypes = data.My_Result;
      const { adult_nbr, child_nbr } = data.My_Params_Check_Availability;
      const sortedRoomTypes = this.sortRoomTypes(newRoomtypes, { adult_nbr, child_nbr });
      booking_store.roomTypes = [...sortedRoomTypes.map(rt => ({ ...rt, rateplans: rt.rateplans?.map(rp => ({ ...rp, variations: this.sortVariations(rp?.variations ?? []) })) }))];
      booking_store.enableBooking = true;
    } catch (error) {
      console.error(error);
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
  public async fetchAvailabilityData(props: any, roomtypeIds: number[], rateplanIds: number[]): Promise<any> {
    const response = await axios.post(`/Check_Availability`, {
      ...props,
      from_date: props.from_date.locale('en').format('YYYY-MM-DD'),
      to_date: props.to_date.locale('en').format('YYYY-MM-DD'),
      room_type_ids: roomtypeIds,
      rate_plan_ids: rateplanIds,
      skip_getting_assignable_units: true,
      is_specific_variation: true,
      is_backend: false,
    });
    const result = response.data as DataStructure;
    if (result.ExceptionMsg !== '') {
      throw new Error(result.ExceptionMsg);
    }

    return result;
  }

  private sortRoomTypes(roomTypes: RoomType[], userCriteria: { adult_nbr: number; child_nbr: number }): RoomType[] {
    const getRatePlanPrices = (rateplan: RatePlan[]) => {
      return rateplan.flatMap(plan => plan.variations?.map(variation => variation.discounted_amount ?? 0))?.filter(Boolean);
    };
    return roomTypes.sort((a, b) => {
      // Priority to available rooms
      if (a.is_available_to_book && !b.is_available_to_book) return -1;
      if (!a.is_available_to_book && b.is_available_to_book) return 1;

      // Check for exact matching variations based on user criteria
      const matchA = a.rateplans?.some(plan =>
        plan.variations?.some(variation => variation.adult_nbr === userCriteria.adult_nbr && variation.child_nbr === userCriteria.child_nbr),
      );
      const matchB = b.rateplans?.some(plan =>
        plan.variations?.some(variation => variation.adult_nbr === userCriteria.adult_nbr && variation.child_nbr === userCriteria.child_nbr),
      );
      if (matchA && !matchB) return -1;
      if (!matchA && matchB) return 1;
      // Sort by the highest variation amount
      const maxVariationA = Math.max(...getRatePlanPrices(a.rateplans));
      const maxVariationB = Math.max(...getRatePlanPrices(b.rateplans));
      if (maxVariationA < maxVariationB) return -1;
      if (maxVariationA > maxVariationB) return 1;

      //Sort by roomtype name

      const rtName1 = a.name.toLowerCase();
      const rtName2 = b.name.toLowerCase();
      if (rtName1 < rtName2) {
        return -1;
      }
      if (rtName1 > rtName2) {
        return 1;
      }

      return 0;
    });
  }
  // private sortRoomTypes(roomTypes: RoomType[], userCriteria: { adult_nbr: number; child_nbr: number }): RoomType[] {
  //   return roomTypes.sort((a, b) => {
  //     // Priority to available rooms
  //     if (a.is_available_to_book && !b.is_available_to_book) return -1;
  //     if (!a.is_available_to_book && b.is_available_to_book) return 1;

  //     // Check for variations where is_calculated is true and amount is 0 or null
  //     const zeroCalculatedA = a.rateplans?.some(plan => plan.variations?.some(variation => variation.discounted_amount === 0 || variation.discounted_amount === null));
  //     const zeroCalculatedB = b.rateplans?.some(plan => plan.variations?.some(variation => variation.discounted_amount === 0 || variation.discounted_amount === null));

  //     // Prioritize these types to be before inventory 0 but after all available ones
  //     if (zeroCalculatedA && !zeroCalculatedB) return 1;
  //     if (!zeroCalculatedA && zeroCalculatedB) return -1;

  //     // Check for exact matching variations based on user criteria
  //     const matchA = a.rateplans?.some(plan =>
  //       plan.variations?.some(variation => variation.adult_nbr === userCriteria.adult_nbr && variation.child_nbr === userCriteria.child_nbr),
  //     );
  //     const matchB = b.rateplans?.some(plan =>
  //       plan.variations?.some(variation => variation.adult_nbr === userCriteria.adult_nbr && variation.child_nbr === userCriteria.child_nbr),
  //     );

  //     if (matchA && !matchB) return -1;
  //     if (!matchA && matchB) return 1;

  //     // Sort by the highest variation amount
  //     const maxVariationA = Math.max(...a.rateplans.flatMap(plan => plan.variations?.map(variation => variation.discounted_amount ?? 0)));
  //     const maxVariationB = Math.max(...b.rateplans.flatMap(plan => plan.variations?.map(variation => variation.discounted_amount ?? 0)));

  //     if (maxVariationA < maxVariationB) return -1;
  //     if (maxVariationA > maxVariationB) return 1;

  //     return 0;
  //   });
  // }

  private sortVariations(variations: Variation[]): Variation[] {
    return variations.sort((a, b) => {
      // Sort by adult_nbr in descending order first
      if (b.adult_nbr !== a.adult_nbr) {
        return b.adult_nbr - a.adult_nbr;
      }
      // If adult_nbr is the same, sort by child_nbr in descending order
      return b.child_nbr - a.child_nbr;
    });
  }
}
