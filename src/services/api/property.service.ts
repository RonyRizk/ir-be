import { PropertyHelpers } from './../app/property-helpers.service';
import { TExposedBookingAvailability } from '@/components/ir-booking-engine/ir-booking-page/ir-availibility-header/availability';
import { MissingTokenError, Token } from '@/models/Token';
import { Booking } from '@/models/booking.dto';
import { DataStructure } from '@/models/commun';
import { ISetupEntries } from '@/models/property';
import app_store from '@/stores/app.store';
import booking_store, { calculateTotalCost, IRatePlanSelection } from '@/stores/booking';
import { checkout_store, ICardProcessingWithCVC, ICardProcessingWithoutCVC, updateUserFormData } from '@/stores/checkout.store';
import { getDateDifference, injectHTML } from '@/utils/utils';
import axios from 'axios';
import { format } from 'date-fns';
import { Colors } from '../app/colors.service';
import { TGuest } from '@/models/user_form';

export class PropertyService extends Token {
  private propertyHelpers = new PropertyHelpers();
  colors: Colors = new Colors();

  public async getExposedProperty(params: { id: number; language: string; aname: string | null; perma_link: string | null }, initTheme: boolean = true) {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Get_Exposed_Property?Ticket=${token}`, {
      ...params,
      currency: app_store.userPreferences.currency_id,
      include_sales_rate_plans: true,
    });
    const result = data as DataStructure;
    if (result.ExceptionMsg !== '') {
      throw new Error(result.ExceptionMsg);
    }
    if (result.My_Result.tags) {
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
      booking_store.roomTypes = [...result.My_Result.roomtypes];
    }
    if (params.aname || params.perma_link) {
      app_store.app_data = { ...app_store.app_data, property_id: result.My_Result.id };
    }
    app_store.property = { ...result.My_Result };
    app_store.app_data.property_id = result.My_Result.id;
    app_store.app_data.displayMode = result.My_Result.be_listing_mode === 'grid' ? 'grid':'default';
    if (initTheme) {
      this.colors.initTheme(result.My_Result);
      // app_store.app_data.displayMode = 'grid';
    }
    return result.My_Result;
  }

  public async getExposedBookingAvailability(props: {
    params: TExposedBookingAvailability;
    identifier: string;
    rp_id?: number;
    rt_id?: number;
    mode: 'modify_rt' | 'default';
    adultChildConstraint?: string;
  }): Promise<DataStructure> {
    const token = this.getToken();
    this.propertyHelpers.validateToken(token);
    this.propertyHelpers.validateModeProps(props);

    const roomtypeIds = this.propertyHelpers.collectRoomTypeIds(props);
    const rateplanIds = this.propertyHelpers.collectRatePlanIds(props);
    const data = await this.propertyHelpers.fetchAvailabilityData(token, props, roomtypeIds, rateplanIds);

    this.propertyHelpers.updateBookingStore(data, props);

    return data;
  }

  public async getExposedBooking(params: { booking_nbr: string; language: string }, withExtras: boolean = true) {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }

    const { data } = await axios.post(`/Get_Exposed_Booking?Ticket=${token}`, {
      ...params,
      extras: withExtras
        ? [
            { key: 'payment_code', value: '' },
            {
              key: 'prepayment_amount',
              value: '',
            },
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
    try {
      const token = this.getToken();
      if (token) {
        if (app_store.setup_entries) {
          return app_store.setup_entries;
        }
        const { data } = await axios.post(`/Get_Setup_Entries_By_TBL_NAME_MULTI?Ticket=${token}`, {
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
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  private filterRooms() {
    let rooms = [];
    Object.values(booking_store.ratePlanSelections).map(rt => {
      Object.values(rt).map((rp: IRatePlanSelection) => {
        if (rp.reserved > 0) {
          [...new Array(rp.reserved)].map((_, index) => {
            const { first_name, last_name } = this.propertyHelpers.extractFirstNameAndLastName(index, rp.guestName);
            rooms.push({
              identifier: null,
              roomtype: rp.roomtype,
              rateplan: rp.ratePlan,
              unit: null,
              smoking_option: rp.checkoutSmokingSelection[index],
              occupancy: {
                adult_nbr: rp.checkoutVariations[index].adult_nbr,
                children_nbr: rp.checkoutVariations[index].child_nbr,
                infant_nbr: null,
              },
              bed_preference: rp.is_bed_configuration_enabled ? rp.checkoutBedSelection[index] : null,
              from_date: format(booking_store.bookingAvailabilityParams.from_date, 'yyyy-MM-dd'),
              to_date: format(booking_store.bookingAvailabilityParams.to_date, 'yyyy-MM-dd'),
              notes: null,
              days: this.propertyHelpers.generateDays(
                booking_store.bookingAvailabilityParams.from_date,
                booking_store.bookingAvailabilityParams.to_date,
                +rp.checkoutVariations[index].amount / getDateDifference(booking_store.bookingAvailabilityParams.from_date, booking_store.bookingAvailabilityParams.to_date),
              ),
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
                cci: ['001', '004'].includes(checkout_store.payment?.code)
                  ? () => {
                      const payment = checkout_store.payment as ICardProcessingWithoutCVC | ICardProcessingWithCVC;
                      return {
                        nbr: payment?.cardNumber,
                        holder_name: payment?.cardHolderName,
                        expiry_month: payment?.expiry_month.split('/')[0],
                        expiry_year: payment?.expiry_year.split('/')[1],
                        cvc: payment?.code === '001' ? payment.cvc : null,
                      };
                    }
                  : null,
              },
            });
          });
        }
      });
    });
    return rooms;
  }
  public async editExposedGuest(guest: TGuest, book_nbr: string): Promise<any> {
    try {
      const token = this.getToken();
      if (token !== null) {
        const { data } = await axios.post(`/Edit_Exposed_Guest?Ticket=${token}`, { ...guest, book_nbr });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        return data.My_Result;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async bookUser() {
    const { prePaymentAmount } = calculateTotalCost();
    try {
      const token = this.getToken();
      if (!token) {
        throw new MissingTokenError();
      }
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
        cci: null,
      };
      const body = {
        assign_units: false,
        check_in: false,
        is_pms: false,
        is_direct: true,
        agent: booking_store.bookingAvailabilityParams.agent ? { id: booking_store.bookingAvailabilityParams.agent } : null,
        is_in_loyalty_mode: booking_store.bookingAvailabilityParams.loyalty,
        promo_key: booking_store.bookingAvailabilityParams.coupon ?? null,
        booking: {
          booking_nbr: '',
          from_date: format(booking_store.bookingAvailabilityParams.from_date, 'yyyy-MM-dd'),
          to_date: format(booking_store.bookingAvailabilityParams.to_date, 'yyyy-MM-dd'),
          remark: checkout_store.userFormData.message || null,
          property: {
            id: app_store.app_data.property_id,
          },
          source: { code: app_store.app_data.isFromGhs ? 'ghs' : window.location.href, tag: app_store.app_data.stag, description: '' },
          referrer_site: app_store.app_data.affiliate ? `https://${app_store.app_data.affiliate.sites[0].url}` : 'www.igloorooms.com',
          currency: app_store.property.currency,
          arrival: { code: checkout_store.userFormData.arrival_time },
          guest,
          rooms: this.filterRooms(),
        },
        extras: [
          {
            key: 'payment_code',
            value: checkout_store.payment.code,
          },
          {
            key: 'prepayment_amount',
            value: prePaymentAmount,
          },
        ],
        pickup_info: checkout_store.pickup.location ? this.propertyHelpers.convertPickup(checkout_store.pickup) : null,
      };
      const { data } = await axios.post(`/DoReservation?Ticket=${token}`, body);
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
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }

    const { data } = await axios.post(`/Get_Exposed_Guest?Ticket=${token}`, {
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
