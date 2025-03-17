import { PropertyHelpers } from './../app/property-helpers.service';
import { TExposedBookingAvailability } from '@/components/ir-booking-engine/ir-booking-page/ir-availability-header/availability';
import { Booking } from '@/models/booking.dto';
import { ISetupEntries } from '@/models/property';
import app_store from '@/stores/app.store';
import booking_store, { IRatePlanSelection } from '@/stores/booking';
import { checkout_store, ICardProcessingWithCVC, updateUserFormData } from '@/stores/checkout.store';
import { injectHTML } from '@/utils/utils';
import axios from 'axios';
import { Colors } from '../app/colors.service';
import { TGuest } from '@/models/user_form';
import { DataStructure } from '@/models/common';
import VariationService from '../app/variation.service';

export class PropertyService {
  private propertyHelpers = new PropertyHelpers();
  private static initialized = false;
  colors: Colors = new Colors();

  public async getExposedProperty(params: { id: number; language: string; aname: string | null; perma_link: string | null }, initTheme: boolean = true) {
    const { data } = await axios.post(`/Get_Exposed_Property`, {
      ...params,
      currency: app_store.userPreferences.currency_id,
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
    app_store.app_data.displayMode = result.My_Result.be_listing_mode === 'grid' ? 'grid' : 'default';
    app_store.property = { ...result.My_Result };
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
    const roomtypeIds = this.propertyHelpers.collectRoomTypeIds(props);
    const rateplanIds = this.propertyHelpers.collectRatePlanIds(props);
    const data = await this.propertyHelpers.fetchAvailabilityData(props, roomtypeIds, rateplanIds);
    this.propertyHelpers.updateBookingStore(data);
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

  private filterRooms() {
    let rooms = [];
    const variationService = new VariationService();
    Object.values(booking_store.ratePlanSelections).map(rt => {
      Object.values(rt).map((rp: IRatePlanSelection) => {
        if (rp.reserved > 0) {
          [...new Array(rp.reserved)].map((_, index) => {
            const { first_name, last_name } = this.propertyHelpers.extractFirstNameAndLastName(index, rp.guestName);
            const variation = variationService.getVariationBasedOnInfants({
              baseVariation: rp.checkoutVariations[index],
              variations: rp.ratePlan.variations,
              infants: rp.infant_nbr[index],
            });
            rooms.push({
              identifier: null,
              roomtype: rp.roomtype,
              rateplan: rp.ratePlan,
              prepayment_amount_gross: rp?.selected_variation?.prepayment_amount_gross,
              unit: null,
              smoking_option: rp.checkoutSmokingSelection[index],
              occupancy: {
                adult_nbr: rp.checkoutVariations[index].adult_nbr,
                children_nbr: rp.checkoutVariations[index].child_nbr - rp.infant_nbr[index],
                infant_nbr: rp.infant_nbr[index],
              },
              bed_preference: rp.is_bed_configuration_enabled ? rp.checkoutBedSelection[index] : null,
              from_date: booking_store.bookingAvailabilityParams.from_date.locale('en').format('YYYY-MM-DD'),
              to_date: booking_store.bookingAvailabilityParams.to_date.locale('en').format('YYYY-MM-DD'),
              notes: null,
              // days: this.propertyHelpers.generateDays(
              //   booking_store.bookingAvailabilityParams.from_date,
              //   booking_store.bookingAvailabilityParams.to_date,
              //   Number(variation.discounted_amount) / getDateDifference(booking_store.bookingAvailabilityParams.from_date, booking_store.bookingAvailabilityParams.to_date),
              // ),
              days: variation.nights.map(n => ({
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

  public async bookUser() {
    const prePaymentAmount = checkout_store.prepaymentAmount;
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
          source: { code: app_store.app_data.isFromGhs ? 'ghs' : new URL(window.location.href).origin, tag: app_store.app_data.stag, description: '' },
          referrer_site: app_store.app_data.affiliate ? `https://${app_store.app_data.affiliate.sites[0].url}` : 'www.igloorooms.com',
          currency: app_store.currencies.find(currency => currency.code.toString().toLowerCase() === app_store.userPreferences.currency_id.toLowerCase()),
          arrival: { code: checkout_store.userFormData.arrival_time },
          guest,
          rooms: this.filterRooms(),
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
            value: app_store.userPreferences.currency_id,
          },
        ].filter(f => f !== null),
        pickup_info: checkout_store.pickup.location ? this.propertyHelpers.convertPickup(checkout_store.pickup) : null,
      };

      const { data } = await axios.post(`/DoReservation`, body);
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data['My_Result'];
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
