import { Booking } from '@/models/booking.dto';
import { BeddingSetup, ISmokingOption, RatePlan, RoomType, Variation } from '@/models/property';
import { createStore } from '@stencil/store';

export interface IRatePlanSelection {
  reserved: number;
  visibleInventory: number;
  selected_variation: { variation: Variation; state: 'default' | 'modified' };
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
  from_date: Date | null;
  to_date: Date | null;
  adult_nbr: number;
  child_nbr: number;
  coupon?: string;
  agent?: number;
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
}

const initialState: BookingStore = {
  tax_statement: null,
  roomTypes: undefined,
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
function setSelectedVariation(lastVariation: Variation, variations: Variation[], currentVariation: ISelectedVariation): ISelectedVariation {
  // console.log(lastVariation, variations, currentVariation);
  if (currentVariation?.state === 'default' || !currentVariation || booking_store.resetBooking) {
    return { state: 'default', variation: lastVariation };
  }
  const currentVariationIdx = variations.findIndex(v => v.adult_child_offering === currentVariation.variation.adult_child_offering);
  if (currentVariationIdx === -1) {
    return { state: 'default', variation: lastVariation };
  }
  return currentVariation;
}
// function setSelectedVariation(lastVariation: Variation, variations: Variation[], currentVariation: ISelectedVariation): ISelectedVariation {
//   if (currentVariation?.state === 'default' || !currentVariation || booking_store.resetBooking) {
//     const variationWithAmount = variations.find(v => v.amount > 0);
//     return { state: 'default', variation: variationWithAmount ?? lastVariation };
//   }
//   const currentVariationIdx = variations.findIndex(v => v.adult_child_offering === currentVariation.variation.adult_child_offering);
//   if (currentVariationIdx === -1) {
//     const variationWithAmount = variations.find(v => v.amount > 0);
//     return { state: 'default', variation: variationWithAmount ?? lastVariation };
//   }
//   return currentVariation;
// }
onRoomTypeChange('roomTypes', (newValue: RoomType[]) => {
  // console.log('hellow', newValue);
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
              selected_variation: setSelectedVariation(lastVariation, ratePlan.variations, currentRatePlanSelection.selected_variation),
              visibleInventory: roomType.inventory === 1 ? 2 : roomType.inventory,
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
              visibleInventory: roomType.inventory === 1 ? 2 : roomType.inventory,
              selected_variation: setSelectedVariation(lastVariation, ratePlan.variations, currentRatePlanSelection?.selected_variation),
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
  // console.log(ratePlanSelections);
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
      const availableRooms = roomTypeData ? (roomTypeData.inventory === 1 ? 2 : roomTypeData.inventory) - totalSelectedRoomsExcludingCurrent : 0;

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

export function calculateTotalCost(gross: boolean = false): { totalAmount: number; prePaymentAmount: number } {
  let prePaymentAmount = 0;
  let totalAmount = 0;
  const calculateCost = (ratePlan: IRatePlanSelection, isPrePayment: boolean = false) => {
    if (ratePlan.checkoutVariations.length > 0 && ratePlan.reserved > 0) {
      if (isPrePayment) {
        return ratePlan.reserved * ratePlan.ratePlan.pre_payment_amount || 0;
      }
      return ratePlan.checkoutVariations.reduce((sum, variation) => {
        console.log(gross, variation['amount_gross'], variation['amount'], variation);
        return sum + Number(variation[gross ? 'amount_gross' : 'amount']);
      }, 0);
    } else if (ratePlan.reserved > 0) {
      const amount = isPrePayment ? ratePlan.ratePlan.pre_payment_amount ?? 0 : ratePlan.selected_variation?.variation[gross ? 'amount_gross' : 'amount'];
      return ratePlan.reserved * (amount ?? 0);
    }
    return 0;
  };
  Object.values(booking_store.ratePlanSelections).forEach(value => {
    Object.values(value).forEach(ratePlan => {
      totalAmount += calculateCost(ratePlan);
      prePaymentAmount += calculateCost(ratePlan, true);
    });
  });
  return { totalAmount, prePaymentAmount };
}

export function validateBooking() {
  return Object.values(booking_store.ratePlanSelections).every(roomTypeSelection =>
    Object.values(roomTypeSelection).every(ratePlan => ratePlan.guestName.every(name => name.trim() !== '')),
  );
}
export default booking_store;
