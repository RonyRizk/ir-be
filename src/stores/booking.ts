import { Booking } from '@/models/booking.dto';
import { Agent, BeddingSetup, ISmokingOption, RatePlan, RoomType, Variation } from '@/models/property';
import VariationService from '@/services/app/variation.service';
import { createStore } from '@stencil/store';
import { Moment } from 'moment';

export interface IRatePlanSelection {
  reserved: number;
  visibleInventory: number;
  infant_nbr: number[];
  selected_variation: Variation | null;
  ratePlan: RatePlan;
  guestName: string[];
  is_bed_configuration_enabled: boolean;
  checkoutVariations: Variation[];
  checkoutBedSelection: string[];
  checkoutSmokingSelection: string[];
  roomtype: {
    id: number;
    name: string;
    physicalrooms: null;
    rateplans: null;
    availabilities: null;
    inventory: number;
    rate: number;
    smoking_option: ISmokingOption;
    bedding_setup: BeddingSetup[];
  };
}

export interface IRoomTypeSelection {
  [ratePlanId: number]: IRatePlanSelection;
}
export interface ISelectedVariation {
  variation: Variation;
  state: 'default' | 'modified';
}
export interface IBookinAvailabilityParams {
  from_date: Moment | null;
  to_date: Moment | null;
  adult_nbr: number;
  child_nbr: number;
  coupon?: string;
  agent?: Agent;
  loyalty?: boolean;
  agent_code?: string;
}
interface BookingStore {
  tax_statement: { message: string } | null;
  roomTypes: RoomType[];
  enableBooking: boolean;
  ratePlanSelections: { [roomTypeId: number]: IRoomTypeSelection };
  bookingAvailabilityParams: IBookinAvailabilityParams;
  booking: Booking;
  resetBooking: boolean;
  isInFreeCancelationZone: boolean;
  fictus_booking_nbr: { nbr: string | null };
  childrenAges: string[];
}

const initialState: BookingStore = {
  tax_statement: null,
  roomTypes: undefined,
  childrenAges: [],
  enableBooking: false,
  resetBooking: false,
  ratePlanSelections: {},
  isInFreeCancelationZone: false,
  bookingAvailabilityParams: {
    from_date: null,
    to_date: null,
    adult_nbr: 0,
    child_nbr: 0,
  },
  booking: null,
  fictus_booking_nbr: null,
};

export const { state: booking_store, onChange: onRoomTypeChange } = createStore<BookingStore>(initialState);

function checkVariation(variations: Variation[], selected_variation: Variation): Variation {
  if (!variations) {
    return null;
  }
  if (!selected_variation || booking_store.resetBooking) {
    return variations[0];
  }
  return variations?.find(v => v.adult_nbr === selected_variation.adult_nbr && v.child_nbr === selected_variation.child_nbr) ?? null;
}

onRoomTypeChange('roomTypes', (newValue: RoomType[]) => {
  const currentSelections = booking_store.ratePlanSelections;
  const ratePlanSelections: { [roomTypeId: number]: IRoomTypeSelection } = {};
  newValue.forEach(roomType => {
    if (!roomType.is_active) return;
    ratePlanSelections[roomType.id] = ratePlanSelections[roomType.id] || {};

    roomType.rateplans.forEach(ratePlan => {
      if (!ratePlan.is_active || !ratePlan?.variations?.length) return;
      let lastVariation = ratePlan.variations[ratePlan.variations.length - 1];
      lastVariation = ratePlan.selected_variation ?? lastVariation;
      const currentRatePlanSelection = currentSelections[roomType.id]?.[ratePlan.id];
      ratePlanSelections[roomType.id][ratePlan.id] =
        currentRatePlanSelection && Object.keys(currentRatePlanSelection).length > 0
          ? {
              ...currentRatePlanSelection,
              ratePlan,
              selected_variation: checkVariation(ratePlan.variations, currentRatePlanSelection.selected_variation) ?? null,
              // visibleInventory: roomType.inventory === 1 ? 2 : roomType.inventory,
              visibleInventory: roomType.inventory,
              reserved: roomType.inventory === 0 ? 0 : booking_store.resetBooking ? 0 : currentRatePlanSelection.reserved,
              checkoutVariations: roomType.inventory === 0 ? [] : currentRatePlanSelection.checkoutVariations,
              checkoutBedSelection: roomType.inventory === 0 ? [] : currentRatePlanSelection.checkoutBedSelection,
              checkoutSmokingSelection: roomType.inventory === 0 ? [] : currentRatePlanSelection.checkoutSmokingSelection,
              guestName: roomType.inventory === 0 ? [] : currentRatePlanSelection.guestName,
              roomtype: {
                ...currentRatePlanSelection.roomtype,
              },
            }
          : {
              reserved: 0,
              infant_nbr: [],
              // visibleInventory: roomType.inventory === 1 ? 2 : roomType.inventory,
              visibleInventory: roomType.inventory,
              selected_variation: ratePlan?.variations[0] ?? null,
              ratePlan,
              guestName: [],
              is_bed_configuration_enabled: roomType.is_bed_configuration_enabled,
              roomtype: {
                ...roomType,
                physicalrooms: null,
                rateplans: null,
                availabilities: null,
              },
              checkoutVariations: [],
              checkoutBedSelection: [],
              checkoutSmokingSelection: [],
            };
    });
  });
  booking_store.ratePlanSelections = ratePlanSelections;
  booking_store.resetBooking = false;
});

export function updateInventory(roomTypeId: number) {
  const roomTypeSelection = booking_store.ratePlanSelections[roomTypeId];
  const calculateTotalSelectedRoomsExcludingIndex = (excludedRatePlanId: number) => {
    return Object.entries(roomTypeSelection).reduce((acc, [ratePlanId, ratePlan]) => {
      return Number(ratePlanId) !== excludedRatePlanId ? acc + ratePlan.reserved : acc;
    }, 0);
  };
  const newRatePlans = Object.fromEntries(
    Object.entries(roomTypeSelection).map(([ratePlanId, ratePlan]) => {
      const totalSelectedRoomsExcludingCurrent = calculateTotalSelectedRoomsExcludingIndex(Number(ratePlanId));
      const roomTypeData = booking_store.roomTypes.find(rt => rt.id === roomTypeId);
      // const availableRooms = roomTypeData ? (roomTypeData.inventory === 1 ? 2 : roomTypeData.inventory) - totalSelectedRoomsExcludingCurrent : 0;
      const availableRooms = roomTypeData ? roomTypeData.inventory - totalSelectedRoomsExcludingCurrent : 0;

      return [
        ratePlanId,
        {
          ...ratePlan,
          visibleInventory: availableRooms > 0 ? availableRooms : 0,
        },
      ];
    }),
  );
  if (JSON.stringify(roomTypeSelection) !== JSON.stringify(newRatePlans)) {
    booking_store.ratePlanSelections = {
      ...booking_store.ratePlanSelections,
      [roomTypeId]: newRatePlans,
    };
  }
}
export function updateRoomParams({ ratePlanId, roomTypeId, params }: { roomTypeId: number; ratePlanId: number; params: Partial<IRatePlanSelection> }) {
  booking_store.ratePlanSelections = {
    ...booking_store.ratePlanSelections,
    [Number(roomTypeId)]: {
      ...booking_store.ratePlanSelections[Number(roomTypeId)],
      [ratePlanId]: {
        ...booking_store.ratePlanSelections[roomTypeId][ratePlanId],
        ...params,
      },
    },
  };
}

export function reserveRooms(roomTypeId: number, ratePlanId: number, rooms: number) {
  if (!booking_store.ratePlanSelections[roomTypeId]) {
    booking_store.ratePlanSelections[roomTypeId] = {};
  }
  const roomType = booking_store.roomTypes?.find(r => r.id === roomTypeId);
  if (!roomType) {
    throw new Error('Invalid room type id');
  }
  const ratePlan = roomType.rateplans.find(r => r.id === ratePlanId);
  if (!ratePlan) {
    throw new Error('Invalid rate plan');
  }
  if (!booking_store.ratePlanSelections[roomTypeId][ratePlanId]) {
    booking_store.ratePlanSelections[roomTypeId][ratePlanId] = {
      guestName: null,
      reserved: 0,
      infant_nbr: [],
      is_bed_configuration_enabled: roomType.is_bed_configuration_enabled,
      visibleInventory: 0,
      selected_variation: null,
      ratePlan,
      checkoutVariations: [],
      checkoutBedSelection: [],
      checkoutSmokingSelection: [],
      roomtype: {
        id: roomType.id,
        name: roomType.name,
        physicalrooms: null,
        rateplans: null,
        availabilities: null,
        inventory: roomType.inventory,
        rate: roomType.rate,
        bedding_setup: roomType.bedding_setup,
        smoking_option: roomType.smoking_option,
      },
    };
  }

  booking_store.ratePlanSelections = {
    ...booking_store.ratePlanSelections,
    [Number(roomTypeId)]: {
      ...booking_store.ratePlanSelections[Number(roomTypeId)],
      [ratePlanId]: { ...booking_store.ratePlanSelections[roomTypeId][ratePlanId], reserved: rooms, checkoutVariations: [] },
    },
  };
  updateInventory(roomTypeId);
}

export function getVisibleInventory(roomTypeId: number, ratePlanId: number) {
  if (!booking_store.ratePlanSelections || !booking_store.ratePlanSelections[roomTypeId]) {
    return { reserved: 0, visibleInventory: 0, selected_variation: null };
  }
  return booking_store.ratePlanSelections[roomTypeId][ratePlanId];
}

export function modifyBookingStore(key: keyof BookingStore, value: any) {
  booking_store[key] = value;
}

// export function calculateTotalCost(gross: boolean = false): { totalAmount: number; prePaymentAmount: number } {
//   let prePaymentAmount = 0;
//   let totalAmount = 0;
//   const variationService = new VariationService();
//   const calculateCost = (ratePlan: IRatePlanSelection, isPrePayment: boolean = false) => {
//     if (ratePlan.checkoutVariations.length > 0 && ratePlan.reserved > 0) {
//       if (isPrePayment) {
//         return ratePlan.reserved * ratePlan.ratePlan.pre_payment_amount || 0;
//       }
//       return ratePlan.checkoutVariations.reduce((sum, variation, index) => {
//         const infantBasedVariation = variationService.getVariationBasedOnInfants({
//           variations: ratePlan.ratePlan.variations,
//           baseVariation: variation,
//           infants: ratePlan.infant_nbr[index],
//         });
//         return sum + Number(infantBasedVariation[gross ? 'discounted_gross_amount' : 'discounted_amount']);
//       }, 0);
//     } else if (ratePlan.reserved > 0) {
//       const amount = isPrePayment ? ratePlan.ratePlan.pre_payment_amount ?? 0 : ratePlan.selected_variation[gross ? 'discounted_gross_amount' : 'discounted_amount'];
//       return ratePlan.reserved * (amount ?? 0);
//     }
//     return 0;
//   };
//   Object.values(booking_store.ratePlanSelections).forEach(value => {
//     Object.values(value).forEach(ratePlan => {
//       totalAmount += calculateCost(ratePlan);
//       prePaymentAmount += calculateCost(ratePlan, true);
//     });
//   });
//   return { totalAmount, prePaymentAmount };
// }
type CostCalculationConfig = {
  gross: boolean;
  infants: boolean;
};
export function calculateTotalCost(config: CostCalculationConfig = { gross: false, infants: false }): { totalAmount: number } {
  let totalAmount = 0;
  const variationService = new VariationService();

  // Helper to calculate cost for a single rate plan
  const calculateCost = (ratePlan: IRatePlanSelection): number => {
    if (ratePlan.checkoutVariations.length > 0 && ratePlan.reserved > 0) {
      let variations: Variation[] = ratePlan.checkoutVariations;
      if (config.infants) {
        variations = [
          ...ratePlan.checkoutVariations.map((variation, index) =>
            variationService.getVariationBasedOnInfants({
              variations: ratePlan.ratePlan.variations,
              baseVariation: variation,
              infants: ratePlan.infant_nbr[index],
            }),
          ),
        ];
      }

      return variations.reduce((sum, infantBasedVariation) => {
        const amount = infantBasedVariation[config.gross ? 'discounted_gross_amount' : 'discounted_amount'] || 0;
        return sum + amount;
      }, 0);
    } else if (ratePlan.reserved > 0) {
      const amount = ratePlan.selected_variation?.[config.gross ? 'discounted_gross_amount' : 'discounted_amount'] || 0;
      return amount * ratePlan.reserved;
    }
    return 0;
  };

  // Iterate through rate plan selections
  Object.values(booking_store.ratePlanSelections).forEach(roomTypeSelection => {
    Object.values(roomTypeSelection).forEach(ratePlan => {
      totalAmount += calculateCost(ratePlan);
    });
  });

  return { totalAmount };
}
// export function validateBooking() {
//   return Object.values(booking_store.ratePlanSelections).every(roomTypeSelection =>
//     Object.values(roomTypeSelection).every(ratePlan => ratePlan.guestName.every(name => name.trim() !== '')),
//   );
// }
// export function validateBooking() {
//   return Object.values(booking_store.ratePlanSelections).every(roomTypeSelection =>
//     Object.values(roomTypeSelection).every(ratePlan => {
//       console.log(ratePlan);
//       return (
//         (ratePlan.guestName.every(name => name.trim() !== '') &&
//           (!ratePlan.is_bed_configuration_enabled || ratePlan.checkoutBedSelection.every(selection => selection !== '-1'))) ||
//         Number(ratePlan.infant_nbr) !== -1
//       );
//     }),
//   );
// }

export function validateBooking() {
  return Object.values(booking_store.ratePlanSelections).every(roomTypeSelection =>
    Object.values(roomTypeSelection).every(ratePlan => {
      // console.log(ratePlan);
      console.log({
        ratePlan,
        'Check guestName: All names must be non-empty': ratePlan.guestName.every(name => name.trim() !== ''),
        'Check bed configuration: If enabled, all selections must be valid':
          !ratePlan.is_bed_configuration_enabled || ratePlan.checkoutBedSelection.every(selection => selection !== '-1'),
        'Check infant_nbr: Must be greater than -1': ratePlan.infant_nbr.every(nb => Number(nb) > -1),
      });
      return (
        // Check guestName: All names must be non-empty
        ratePlan.guestName.every(name => name.trim() !== '') &&
        // Check bed configuration: If enabled, all selections must be valid
        (!ratePlan.is_bed_configuration_enabled || ratePlan.checkoutBedSelection.every(selection => selection !== '-1')) &&
        // Check infant_nbr: Must be greater than -1
        ratePlan.infant_nbr.every(nb => Number(nb) > -1)
      );
    }),
  );
}
export function calculateTotalRooms() {
  return Object.values(booking_store.ratePlanSelections).reduce((total, value) => {
    return (
      total +
      Object.values(value).reduce((innerTotal, ratePlan) => {
        if (ratePlan.reserved === 0) {
          return innerTotal;
        }
        return innerTotal + ratePlan.reserved;
      }, 0)
    );
  }, 0);
}
export function clearCheckoutRooms() {
  booking_store.ratePlanSelections = Object.fromEntries(
    Object.entries(booking_store.ratePlanSelections).map(([roomTypeId, roomTypeSelection]) => [
      roomTypeId,
      Object.fromEntries(
        Object.entries(roomTypeSelection).map(([ratePlanId, ratePlan]) => [
          ratePlanId,
          {
            ...ratePlan,
            checkoutVariations: [],
            checkoutBedSelection: [],
            checkoutSmokingSelection: [],
          },
        ]),
      ),
    ]),
  );
}
export default booking_store;
