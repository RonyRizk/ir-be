import { PropertyHelpers } from './../app/property-helpers.service';
import { TExposedBookingAvailability } from '@/components/ir-booking-engine/ir-booking-page/ir-availability-header/availability';
import { Booking, Room } from '@/models/booking.dto';
import { AllowedPaymentMethod, IExposedProperty, ISetupEntries, RoomType } from '@/models/property';
import app_store from '@/stores/app.store';
import booking_store, { IRatePlanSelection, IRoomTypeSelection } from '@/stores/booking';
import { checkout_store, ICardProcessingWithCVC, updateUserFormData } from '@/stores/checkout.store';
import { getCurrencyByCode, injectHTML, normalize } from '@/utils/utils';
import axios from 'axios';
import { Colors } from '../app/colors.service';
import { TGuest } from '@/models/user_form';
import { DataStructure } from '@/models/common';
import VariationService from '../app/variation.service';

type AvailabilityResponse = Awaited<ReturnType<PropertyService['getExposedBookingAvailability']>>;

export class PropertyService {
  private propertyHelpers = new PropertyHelpers();
  private static initialized = false;
  colors: Colors = new Colors();

  public async getExposedProperty(
    {
      sync = true,
      currency_id = app_store.userPreferences.currency_id,
      ...params
    }: { id: number; language: string; aname: string | null; perma_link: string | null; sync?: boolean; currency_id?: string },
    initTheme: boolean = true,
  ): Promise<IExposedProperty> {
    const { data } = await axios.post(`/Get_Exposed_Property`, {
      ...params,
      currency: currency_id,
      include_sales_rate_plans: true,
    });
    const result = data as DataStructure;
    if (result.ExceptionMsg !== '') {
      throw new Error(result.ExceptionMsg);
    }
    if (result.My_Result.tags && !PropertyService.initialized) {
      PropertyService.initialized = true;
      result.My_Result.tags.map(({ key, value }) => {
        if (!value) {
          return;
        }
        switch (key) {
          case 'header':
            return injectHTML(value, 'head', 'first');
          case 'body':
            return injectHTML(value, 'body', 'first');
          case 'footer':
            return injectHTML(value, 'body', 'last');
        }
      });
    }

    if (!app_store.fetchedBooking) {
      booking_store.roomTypes = [...(result.My_Result?.roomtypes ?? [])];
    }
    // } else {
    //   const oldBookingStoreRoomTypes = [...booking_store.roomTypes];
    //   booking_store.roomTypes = result.My_Result.roomtypes?.map(rt => {
    //     const selectedRt = oldBookingStoreRoomTypes.find(r => r.id === rt.id);
    //     return {
    //       ...rt,
    //       rateplans: rt.rateplans.map(rp => {
    //         const currentRp = selectedRt.rateplans.find(s => s.id === rp.id);
    //         if (currentRp) {
    //           return { ...currentRp, short_name: rp.short_name };
    //         }
    //         return null;
    //       }),
    //     };
    //   });
    // }

    if (!app_store.fetchedBooking) {
      booking_store.roomTypes = [...(result.My_Result?.roomtypes ?? [])];
    }
    if (params.aname || params.perma_link) {
      app_store.app_data = { ...app_store.app_data, property_id: result.My_Result.id };
    }
    // if (!app_store.app_data.geoTimezone) {
    //   const { data } = await axios.get(
    //     `https://api.geotimezone.com/public/timezone?latitude=${result.My_Result.location.latitude}&longitude=${result.My_Result.location.longitude}`,
    //   );
    //   app_store.app_data.geoTimezone = data;
    // }
    app_store.app_data.displayMode = result.My_Result.be_listing_mode === 'grid' ? 'grid' : 'default';
    if (sync) {
      app_store.property = { ...result.My_Result };
    }
    app_store.app_data.property_id = result.My_Result.id;
    booking_store.tax_statement = { message: data.My_Result.tax_statement };
    if (initTheme) {
      this.colors.initTheme(result.My_Result);
    }
    return result.My_Result;
  }
  public async getExposedNonBookableNights(params: { from_date: string; to_date: string; porperty_id: number; aname: string; perma_link: string }) {
    const { data } = await axios.post(`/Get_Exposed_Non_Bookable_Nights`, params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const nights = {};
    data.My_Result?.forEach(nbn => {
      nights[nbn.night] = true;
    });
    app_store.nonBookableNights = nights;
    return data.My_Result;
  }
  public async getExposedBookingAvailability(props: TExposedBookingAvailability): Promise<DataStructure> {
    const roomtypeIds = props.room_type_ids || this.propertyHelpers.collectRoomTypeIds(props);
    const rateplanIds = props.rate_plan_ids || this.propertyHelpers.collectRatePlanIds(props);
    const data = await this.propertyHelpers.fetchAvailabilityData(props, roomtypeIds, rateplanIds);
    if (props.update_store) {
      this.propertyHelpers.updateBookingStore(data);
    }
    return data;
  }

  public async getExposedBooking(params: { booking_nbr: string; language: string; currency: string }, withExtras: boolean = true) {
    const { data } = await axios.post(`/Get_Exposed_Booking`, {
      ...params,
      extras: withExtras
        ? [
            { key: 'payment_code', value: '' },
            {
              key: 'prepayment_amount',
              value: '',
            },
            { key: 'payment_code', value: '' },
            { key: 'agent_payment_mode', value: '' },
          ]
        : null,
    });
    const result = data as DataStructure;
    if (result.ExceptionMsg !== '') {
      throw new Error(result.ExceptionMsg);
    }
    return result.My_Result as Booking;
  }
  public async fetchSetupEntries(): Promise<ISetupEntries> {
    if (app_store.setup_entries) {
      return app_store.setup_entries;
    }
    const { data } = await axios.post(`/Get_Setup_Entries_By_TBL_NAME_MULTI`, {
      TBL_NAMES: ['_ARRIVAL_TIME', '_RATE_PRICING_MODE', '_BED_PREFERENCE_TYPE'],
    });
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const res: any[] = data.My_Result;
    const setupEntries = {
      arrivalTime: res.filter(e => e.TBL_NAME === '_ARRIVAL_TIME'),
      ratePricingMode: res.filter(e => e.TBL_NAME === '_RATE_PRICING_MODE'),
      bedPreferenceType: res.filter(e => e.TBL_NAME === '_BED_PREFERENCE_TYPE'),
    };
    app_store.setup_entries = setupEntries;
    updateUserFormData('arrival_time', setupEntries.arrivalTime[0].CODE_NAME);
    return setupEntries;
  }

  // private async filterRooms(roomTypes: RoomType[] | null) {
  //   let rooms = [];
  //   const hasDifferentCurrency = app_store.userPreferences.currency_id.toLocaleLowerCase() !== app_store.property?.currency?.code.toLocaleLowerCase();
  //   if (app_store.userPreferences.currency_id.toLocaleLowerCase() !== app_store.property?.currency?.code.toLocaleLowerCase()) {
  //     // const data = await this.getExposedBookingAvailability({ ...checkAvailabilityPayload, currency_ref: app_store.property.currency.code });
  //     // roomTypes = data.My_Result as RoomType[];
  //   }
  //   const variationService = new VariationService();
  //   Object.values(booking_store.ratePlanSelections).map(rt => {
  //     Object.values(rt).map((rp: IRatePlanSelection) => {
  //       if (rp.reserved > 0) {
  //         const roomType = roomTypes?.find(rt => rt === rp.roomtype);
  //         const ratePlan = roomType?.rateplans.find(r => rp.ratePlan.id === r.id);
  //         [...new Array(rp.reserved)].map((_, index) => {
  //           const { first_name, last_name } = this.propertyHelpers.extractFirstNameAndLastName(index, rp.guestName);
  //           const variation = variationService.getVariationBasedOnInfants({
  //             baseVariation: hasDifferentCurrency
  //               ? ratePlan?.variations.find(
  //                   v =>
  //                     v.adult_nbr === rp.checkoutVariations[index].adult_nbr &&
  //                     v.child_nbr === rp.checkoutVariations[index].child_nbr &&
  //                     v.infant_nbr === rp.checkoutVariations[index].infant_nbr,
  //                 )
  //               : rp.checkoutVariations[index],
  //             variations: hasDifferentCurrency ? ratePlan?.variations : rp.ratePlan.variations,
  //             infants: rp.infant_nbr[index],
  //           });
  //           rooms.push({
  //             identifier: null,
  //             roomtype: rp.roomtype,
  //             rateplan: rp.ratePlan,
  //             prepayment_amount_gross: hasDifferentCurrency ? variation?.prepayment_amount_gross : rp?.selected_variation?.prepayment_amount_gross,
  //             unit: null,
  //             smoking_option: rp.checkoutSmokingSelection[index],
  //             occupancy: {
  //               adult_nbr: rp.checkoutVariations[index].adult_nbr,
  //               children_nbr: rp.checkoutVariations[index].child_nbr - rp.infant_nbr[index],
  //               infant_nbr: rp.infant_nbr[index],
  //             },
  //             bed_preference: rp.is_bed_configuration_enabled ? rp.checkoutBedSelection[index] : null,
  //             from_date: booking_store.bookingAvailabilityParams.from_date.locale('en').format('YYYY-MM-DD'),
  //             to_date: booking_store.bookingAvailabilityParams.to_date.locale('en').format('YYYY-MM-DD'),
  //             notes: null,
  //             days: variation.nights.map(n => ({
  //               date: n.night,
  //               amount: n.discounted_amount,
  //               cost: null,
  //             })),
  //             guest: {
  //               email: null,
  //               first_name,
  //               last_name,
  //               country_id: null,
  //               city: null,
  //               mobile: null,
  //               address: null,
  //               dob: null,
  //               subscribe_to_news_letter: null,
  //               cci: null,
  //             },
  //           });
  //         });
  //       }
  //     });
  //   });
  //   return rooms;
  // }
  /**
   * Builds the array of room payloads for reservation based on the user's current selections.
   *
   * For each reserved entry in `booking_store.ratePlanSelections`, this method:
   *  1) Resolves the effective `RoomType` and `RatePlan` (preferring the provided `roomTypes`
   *     argument if available, otherwise falling back to `booking_store.roomTypes`).
   *  2) Detects currency context differences between the user's currency and the property's currency.
   *  3) Locates a base variation for each reserved unit (matching adult/child/infant counts). When
   *     in a different-currency context, variations are taken from the effective rate plan instead of
   *     the selection object. If no exact variation is found, the checkout variation is used.
   *  4) Adjusts the variation with infants via `VariationService.getVariationBasedOnInfants`.
   *  5) Produces a normalized "room" object used by the booking API.
   *
   * @private
   * @param {RoomType[] | null} roomTypes - Room types in the effective currency context; falls back to `booking_store.roomTypes` if `null`.
   * @returns {Room[]} Array of normalized `Room` payloads ready for `/DoReservation`.
   *
   * @example
   * // Use effective availability (e.g., after currency switch) to build reservation rooms:
   * const rooms = this.filterRooms(freshAvailabilityRoomTypes);
   * // Send in booking body: { booking: { rooms }, ... }
   */
  private filterRooms(roomTypes: RoomType[] | null): Room[] {
    const rooms: any[] = [];
    const variationService = new VariationService();
    const hasDifferentCurrency = normalize(app_store.userPreferences.currency_id) !== normalize(app_store.property?.currency?.code);

    const effectiveRoomTypes = roomTypes ?? booking_store.roomTypes ?? [];
    const roomTypeLookup = new Map<number, RoomType>();
    effectiveRoomTypes.forEach(rt => {
      if (rt) roomTypeLookup.set(rt.id, rt);
    });

    Object.values(booking_store.ratePlanSelections).forEach(ratePlanSelections => {
      Object.values(ratePlanSelections).forEach((rp: IRatePlanSelection) => {
        if (!rp?.reserved) return;

        const selectedRoomType = roomTypeLookup.get(rp.roomtype.id) ?? null;
        const selectedRatePlan = selectedRoomType?.rateplans?.find(plan => plan.id === rp.ratePlan.id) ?? rp.ratePlan;
        const currencyVariations = hasDifferentCurrency ? (selectedRatePlan?.variations ?? []) : (rp.ratePlan.variations ?? []);

        for (let index = 0; index < rp.reserved; index += 1) {
          const checkoutVariation = rp.checkoutVariations?.[index];
          if (!checkoutVariation) continue;

          const infants = rp.infant_nbr?.[index] ?? 0;
          const baseVariation = hasDifferentCurrency
            ? (currencyVariations.find(
                v => v.adult_nbr === checkoutVariation.adult_nbr && v.child_nbr === checkoutVariation.child_nbr && (v.infant_nbr ?? 0) === (checkoutVariation.infant_nbr ?? 0),
              ) ?? checkoutVariation)
            : checkoutVariation;

          const resolvedVariation =
            variationService.getVariationBasedOnInfants({
              baseVariation,
              variations: currencyVariations.length ? currencyVariations : (rp.ratePlan.variations ?? []),
              infants,
            }) ?? baseVariation;

          const { first_name, last_name } = this.propertyHelpers.extractFirstNameAndLastName(index, rp.guestName);
          const nights = resolvedVariation?.nights ?? checkoutVariation?.nights ?? [];

          rooms.push({
            identifier: null,
            roomtype: selectedRoomType ?? rp.roomtype,
            rateplan: selectedRatePlan,
            prepayment_amount_gross: hasDifferentCurrency
              ? (resolvedVariation?.prepayment_amount_gross ?? 0)
              : (rp.selected_variation?.prepayment_amount_gross ?? resolvedVariation?.prepayment_amount_gross ?? 0),
            unit: null,
            smoking_option: rp.checkoutSmokingSelection?.[index] ?? null,
            occupancy: {
              adult_nbr: checkoutVariation.adult_nbr,
              children_nbr: Math.max(0, (checkoutVariation.child_nbr ?? 0) - infants),
              infant_nbr: infants,
            },
            bed_preference: rp.is_bed_configuration_enabled ? (rp.checkoutBedSelection?.[index] ?? null) : null,
            from_date: booking_store.bookingAvailabilityParams.from_date.locale('en').format('YYYY-MM-DD'),
            to_date: booking_store.bookingAvailabilityParams.to_date.locale('en').format('YYYY-MM-DD'),
            notes: null,
            days: nights.map(n => ({
              date: n.night,
              amount: n.discounted_amount,
              cost: null,
            })),
            guest: {
              email: null,
              first_name,
              last_name,
              country_id: null,
              city: null,
              mobile: null,
              address: null,
              dob: null,
              subscribe_to_news_letter: null,
              cci: null,
            },
          });
        }
      });
    });

    return rooms;
  }

  public async editExposedGuest(guest: TGuest, book_nbr: string): Promise<any> {
    const { data } = await axios.post(`/Edit_Exposed_Guest`, { ...guest, book_nbr });
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result;
  }

  // Returns a Currency object from app_store.currencies or null if no change is needed.
  // Priority: user's currency (if allowed) → hotel's currency (if allowed) → first allowed currency.
  // If the chosen currency equals the user's currency, returns null to indicate no switch is needed.
  private getMostEffectiveCurrency = (paymentMethod: AllowedPaymentMethod): (typeof app_store.currencies)[number] | null => {
    const allowed = normalize(paymentMethod?.allowed_currencies || '');
    if (!allowed) return null;

    const allowedList = allowed
      .split(',')
      .map(c => normalize(c))
      .filter(Boolean);

    if (allowedList.length === 0) return null;

    // Resolve user + hotel currency objects (fall back to 'usd' only if needed)
    const userCode = normalize(app_store.userPreferences?.currency_id) || 'usd';
    const hotelCode = normalize(app_store.property?.currency?.code);
    const hotelCurrency = hotelCode ? getCurrencyByCode(hotelCode) : null;

    // 1) If the user's currency is allowed → no change.
    if (allowedList.includes(userCode)) return null;

    // 2) If the hotel's currency is allowed → switch to hotel currency.
    if (hotelCode && allowedList.includes(hotelCode) && hotelCurrency) return hotelCurrency;

    // 3) Otherwise, pick the first allowed currency we can resolve from the store.
    for (const code of allowedList) {
      const cur = getCurrencyByCode(code);
      if (cur) {
        // If this equals user currency (rare: user not in allowedList but store normalization mismatch), treat as no change.
        if (normalize(cur.code) === userCode) return null;
        return cur;
      }
    }

    // If none of the allowed codes exist in app_store.currencies, don't switch.
    return null;
  };
  /**
   * Collects the IDs of room types and rate plans that have at least one room reserved
   * in the current `booking_store.ratePlanSelections`.
   *
   * Iterates over the nested selection map and includes only entries where
   * `reserved > 0`.
   *
   * @private
   * @returns {{ roomTypeIds: number[]; ratePlanIds: number[] }}
   * An object containing:
   *  - `roomTypeIds`: unique room type IDs with reservations.
   *  - `ratePlanIds`: unique rate plan IDs with reservations.
   *
   * @example
   * const { roomTypeIds, ratePlanIds } = this.collectBookedRoomsId();
   * // Use these arrays to build availability or pricing payloads.
   */
  private collectBookedRoomsId(): { roomTypeIds: number[]; ratePlanIds: number[] } {
    const roomTypeIds = new Set<number>();
    const ratePlanIds = new Set<number>();

    for (const roomtypeId in booking_store.ratePlanSelections) {
      for (const rateplanId in booking_store.ratePlanSelections[roomtypeId]) {
        const rateplan = booking_store.ratePlanSelections[roomtypeId][rateplanId];
        if (rateplan.reserved > 0) {
          roomTypeIds.add(Number(roomtypeId));
          ratePlanIds.add(Number(rateplanId));
        }
      }
    }
    return { ratePlanIds: Array.from(ratePlanIds), roomTypeIds: Array.from(roomTypeIds) };
  }

  /**
   * Recalculates the total prepayment amount for the currently selected rooms.
   *
   * Walks through the provided `roomTypes`, finds the matching user-selected
   * rate plans/variations from `booking_store.ratePlanSelections`, and sums
   * each stay’s `prepayment_amount_gross`. If an exact base variation is not
   * found (by adult/child/infant counts), the checkout variation is used as a fallback.
   * Infant counts are applied via `VariationService.getVariationBasedOnInfants`.
   *
   * @private
   * @param {RoomType[]} roomTypes - The room types returned from availability (in the currency context used for recalculation).
   * @returns {number} Total prepayment amount (sum of `prepayment_amount_gross`) for all reserved rooms.
   *
   * @example
   * // After fetching availability in a different currency:
   * const total = this.recalculatePrepaymentAmount(data.My_Result);
   * console.log('New prepayment amount:', total);
   */
  private recalculatePrepaymentAmount(roomTypes: RoomType[]): number {
    let total = 0;
    const variationService = new VariationService();

    for (const roomType of roomTypes as RoomType[]) {
      const selectedRoomType = booking_store.ratePlanSelections[roomType.id] as IRoomTypeSelection | undefined;
      if (!selectedRoomType) continue;

      for (const ratePlan of roomType.rateplans) {
        const selectedRatePlan = selectedRoomType[ratePlan.id];
        if (!selectedRatePlan) continue;

        const { checkoutVariations, infant_nbr } = selectedRatePlan;
        checkoutVariations.forEach((checkoutVariation, index) => {
          const baseVariation =
            ratePlan.variations.find(
              v => v.adult_nbr === checkoutVariation.adult_nbr && v.child_nbr === checkoutVariation.child_nbr && v.infant_nbr === checkoutVariation.infant_nbr,
            ) ?? checkoutVariation;

          if (!baseVariation) return;

          const variation = variationService.getVariationBasedOnInfants({
            baseVariation,
            variations: ratePlan.variations,
            infants: infant_nbr?.[index] ?? 0,
          });

          total += variation?.prepayment_amount_gross ?? 0;
        });
      }
    }
    return total;
  }

  public async bookUser(
    paymentMethod: AllowedPaymentMethod,
  ): Promise<{ booking: Booking; prepaymentAmount: number; mostEffectiveCurrency: (typeof app_store.currencies)[number] | null }> {
    let prePaymentAmount = checkout_store.prepaymentAmount;
    const mostEffectiveCurrency = this.getMostEffectiveCurrency(paymentMethod);
    const { ratePlanIds, roomTypeIds } = this.collectBookedRoomsId();
    let checkAvailabilityPayload = {
      propertyid: app_store.app_data.property_id,
      from_date: booking_store.bookingAvailabilityParams.from_date,
      to_date: booking_store.bookingAvailabilityParams.to_date,
      room_type_ids: roomTypeIds,
      rate_plan_ids: ratePlanIds,
      adult_nbr: booking_store.bookingAvailabilityParams.adult_nbr,
      child_nbr: booking_store.bookingAvailabilityParams.child_nbr,
      language: app_store.userPreferences.language_id,
      is_in_loyalty_mode: booking_store.bookingAvailabilityParams.loyalty ? true : !!booking_store.bookingAvailabilityParams.coupon,
      promo_key: booking_store.bookingAvailabilityParams.coupon || '',
      is_in_agent_mode: !!booking_store.bookingAvailabilityParams.agent || false,
      agent_id: booking_store.bookingAvailabilityParams.agent?.id || 0,
      is_in_affiliate_mode: !!app_store.app_data.affiliate,
      affiliate_id: app_store.app_data.affiliate ? app_store.app_data.affiliate.id : null,
      update_store: false,
    };

    let roomTypes: RoomType[] | null = null;
    const normalizedUserCurrency = normalize(app_store.userPreferences?.currency_id) || 'usd';
    const normalizedMethodCurrency = mostEffectiveCurrency ? normalize(mostEffectiveCurrency.code) : null;
    const normalizedPropertyCurrency = normalize(app_store.property?.currency?.code);
    const hasDifferentCurrency = normalizedUserCurrency !== normalizedPropertyCurrency;

    const wantsMethodCurrency = prePaymentAmount > 0 && normalizedMethodCurrency && normalizedMethodCurrency !== normalizedUserCurrency;
    const needsPropertyAvailability = hasDifferentCurrency && (!wantsMethodCurrency || normalizedMethodCurrency !== normalizedPropertyCurrency);

    let methodAvailability: AvailabilityResponse | null = null;
    let propertyAvailability: AvailabilityResponse | null = null;

    const availabilityCalls: Promise<void>[] = [];

    if (wantsMethodCurrency && mostEffectiveCurrency) {
      availabilityCalls.push(
        this.getExposedBookingAvailability({ ...checkAvailabilityPayload, currency_ref: mostEffectiveCurrency.code }).then(data => {
          methodAvailability = data;
          if (normalizedMethodCurrency === normalizedPropertyCurrency) {
            roomTypes = [...data.My_Result];
          }
        }),
      );
    }

    if (needsPropertyAvailability) {
      availabilityCalls.push(
        this.getExposedBookingAvailability({ ...checkAvailabilityPayload, currency_ref: app_store.property.currency.code }).then(data => {
          propertyAvailability = data;
          if (!roomTypes) {
            roomTypes = [...data.My_Result];
          }
        }),
      );
    }
    if (availabilityCalls.length) {
      await Promise.all(availabilityCalls);
    }
    if (methodAvailability && wantsMethodCurrency && mostEffectiveCurrency) {
      prePaymentAmount = this.recalculatePrepaymentAmount(methodAvailability.My_Result);
    }
    if (!roomTypes && propertyAvailability) {
      roomTypes = [...propertyAvailability.My_Result];
    }
    try {
      let guest: any = {
        email: checkout_store.userFormData.email,
        first_name: checkout_store.userFormData.firstName,
        last_name: checkout_store.userFormData.lastName,
        country_id: checkout_store.userFormData.country_id,
        city: null,
        mobile: checkout_store.userFormData.mobile_number,
        address: '',
        country_phone_prefix: checkout_store.userFormData.country_phone_prefix,
        dob: null,
        subscribe_to_news_letter: true,
        cci:
          booking_store.bookingAvailabilityParams.agent && booking_store.bookingAvailabilityParams.agent?.payment_mode?.code === '001'
            ? null
            : checkout_store.payment?.code === '001'
              ? {
                  nbr: (checkout_store.payment as ICardProcessingWithCVC)?.cardNumber?.replace(/ /g, ''),
                  holder_name: (checkout_store.payment as ICardProcessingWithCVC)?.cardHolderName,
                  expiry_month: (checkout_store.payment as ICardProcessingWithCVC)?.expiry_month.split('/')[0],
                  expiry_year: (checkout_store.payment as ICardProcessingWithCVC)?.expiry_year.split('/')[1],
                  cvc: (checkout_store.payment as ICardProcessingWithCVC).cvc,
                }
              : null,
      };
      // const now = moment();
      const rooms = this.filterRooms(roomTypes);
      const pickup_info = checkout_store.pickup.location ? await this.propertyHelpers.convertPickup(checkout_store.pickup, hasDifferentCurrency) : null;
      const body = {
        assign_units: false,
        check_in: false,
        is_pms: false,
        is_direct: true,
        language: app_store?.userPreferences?.language_id ?? 'en',
        agent: booking_store.bookingAvailabilityParams.agent ? { id: booking_store.bookingAvailabilityParams.agent?.id } : null,
        is_in_loyalty_mode: booking_store.bookingAvailabilityParams.loyalty,
        promo_key: booking_store.bookingAvailabilityParams.coupon ?? null,
        booking: {
          booking_nbr: '',
          from_date: booking_store.bookingAvailabilityParams.from_date.locale('en').format('YYYY-MM-DD'),
          to_date: booking_store.bookingAvailabilityParams.to_date.locale('en').format('YYYY-MM-DD'),
          remark: checkout_store.userFormData.message || null,
          property: {
            id: app_store.app_data.property_id,
          },
          // booked_on: {
          //   date: now.format('YYYY-MM-DD'),
          //   hour: now.hour(),
          //   minute: now.minute(),
          // },
          source: { code: app_store.app_data.isFromGhs ? 'ghs' : new URL(window.location.href).origin, tag: app_store.app_data.stag, description: '' },
          referrer_site: app_store.app_data.affiliate ? `https://${app_store.app_data.affiliate.sites[0].url}` : 'www.igloorooms.com',
          // currency: app_store.currencies.find(currency => currency.code.toString().toLowerCase() === app_store.userPreferences.currency_id.toLowerCase()),
          currency: app_store.property.currency,
          arrival: { code: checkout_store.userFormData.arrival_time },
          guest,
          rooms,
        },
        extras: [
          {
            key: 'payment_code',
            value: checkout_store.payment.code,
          },
          prePaymentAmount > 0
            ? {
                key: 'prepayment_amount',
                value: prePaymentAmount,
              }
            : null,
          booking_store.bookingAvailabilityParams.agent
            ? {
                key: 'agent_payment_mode',
                value: booking_store.bookingAvailabilityParams.agent.payment_mode.code,
              }
            : null,
          {
            key: 'selected_currency',
            value: app_store.property.currency.code,
          },
        ].filter(f => f !== null),
        pickup_info,
      };

      // if (f) {
      //   throw new Error('');
      // }

      const { data } = await axios.post(`/DoReservation`, body);
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return { booking: data['My_Result'], prepaymentAmount: prePaymentAmount, mostEffectiveCurrency: mostEffectiveCurrency };
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  public async getExposedGuest() {
    const { data } = await axios.post(`/Get_Exposed_Guest`, {
      email: null,
    });
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const res = data.My_Result;
    if (res === null) {
      app_store.is_signed_in = false;
      return;
    }
    // app_store.is_signed_in = true;
    checkout_store.userFormData = {
      ...checkout_store.userFormData,
      country_id: res.country_id,
      email: res.email,
      firstName: res.first_name,
      lastName: res.last_name,
      mobile_number: res.mobile,
      country_phone_prefix: res.country_phone_prefix,
      id: res.id,
    };
  }
}
