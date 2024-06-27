import { RoomType } from '@/models/property';
import booking_store from '@/stores/booking';

export class PropertyHelpers {
  private static readonly MODE_MODIFY_RT = 'modify_rt';
  private static readonly MODE_DEFAULT = 'default';

  public validateModeProps(props: any) {
    if (props.mode === PropertyHelpers.MODE_MODIFY_RT && (!props.rp_id || !props.rt_id)) {
      throw new Error('Missing property: rp_id or rt_id is required in modify_rt mode');
    }
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

  // private sortRoomTypes(roomTypes: RoomType[], userCriteria: { adult_nbr: number; child_nbr: number }): RoomType[] {
  //   return roomTypes.sort((a, b) => {
  //     // Move room types with zero inventory to the end
  //     if (a.inventory === 0 && b.inventory !== 0) return 1;
  //     if (a.inventory !== 0 && b.inventory === 0) return -1;

  //     // Check for exact matching variations
  //     const matchA = a.rateplans.some(plan => plan.variations.some(variation => variation.adult_nbr === userCriteria.adult_nbr && variation.child_nbr === userCriteria.child_nbr));
  //     const matchB = b.rateplans.some(plan => plan.variations.some(variation => variation.adult_nbr === userCriteria.adult_nbr && variation.child_nbr === userCriteria.child_nbr));

  //     if (matchA && !matchB) return -1;
  //     if (!matchA && matchB) return 1;

  //     // If no matches, sort by the highest variation in any attribute, let's use `amount` as an example
  //     const maxVariationA = Math.max(...a.rateplans.flatMap(plan => plan.variations.map(variation => variation.amount)));
  //     const maxVariationB = Math.max(...b.rateplans.flatMap(plan => plan.variations.map(variation => variation.amount)));

  //     if (maxVariationA > maxVariationB) return -1;
  //     if (maxVariationA < maxVariationB) return 1;

  //     return 0; // If none of the above conditions apply, maintain original order
  //   });
  // }
  private sortRoomTypes(roomTypes: RoomType[], userCriteria: { adult_nbr: number; child_nbr: number }): RoomType[] {
    return roomTypes.sort((a, b) => {
      // Move room types with zero inventory to the end
      if (a.inventory === 0 && b.inventory !== 0) return 1;
      if (a.inventory !== 0 && b.inventory === 0) return -1;

      // Check for exact matching variations
      const matchA = a.rateplans.some(plan => plan.variations.some(variation => variation.adult_nbr === userCriteria.adult_nbr && variation.child_nbr === userCriteria.child_nbr));
      const matchB = b.rateplans.some(plan => plan.variations.some(variation => variation.adult_nbr === userCriteria.adult_nbr && variation.child_nbr === userCriteria.child_nbr));

      if (matchA && !matchB) return -1;
      if (!matchA && matchB) return 1;

      // Sort by the highest variation in any attribute, for example `amount`
      const maxVariationA = Math.max(...a.rateplans.flatMap(plan => plan.variations.map(variation => variation.adult_nbr + variation.child_nbr)));
      const maxVariationB = Math.max(...b.rateplans.flatMap(plan => plan.variations.map(variation => variation.adult_nbr + variation.child_nbr)));

      if (maxVariationA > maxVariationB) return -1;
      if (maxVariationA < maxVariationB) return 1;

      // If variations are equal, sort alphabetically by name
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
