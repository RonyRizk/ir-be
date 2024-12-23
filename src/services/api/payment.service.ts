import { Booking } from '@/models/booking.dto';
import { IBrackets, IExposedApplicablePolicies } from '@/models/property';
import app_store from '@/stores/app.store';
import booking_store from '@/stores/booking';
import localizedWords from '@/stores/localization.store';
import { generateCheckoutUrl } from '@/utils/utils';
import axios from 'axios';
import { isBefore, isSameDay, parseISO } from 'date-fns';

type TExposedApplicablePolicies = { data: IExposedApplicablePolicies[]; amount: number; room_type_id?: number; rate_plan_id?: number };
interface FetchCancelationMessageWithData {
  data: IExposedApplicablePolicies[];
  showCancelation?: boolean;
}

interface FetchCancelationMessageWithoutData {
  id: number;
  roomTypeId: number;
  bookingNbr?: string;
  showCancelation?: boolean;
  data?: null;
}

type FetchCancelationMessageParams = FetchCancelationMessageWithData | FetchCancelationMessageWithoutData;
export type TBookingInfo = { statement: string; rp_name: string; rt_name: string };
export class PaymentService {
  public async getExposedCancelationDueAmount(params: { booking_nbr: string; currency_id: number }) {
    const { data } = await axios.post(`/Get_Exposed_Cancelation_Due_Amount`, {
      ...params,
    });
    if (data['ExceptionMsg'] !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const res = data['My_Result'];
    return res;
  }

  public async GeneratePaymentCaller({
    token,
    params,
    onRedirect,
    onScriptRun,
  }: {
    token: string;
    params: { booking_nbr: string; amount: number; currency_id: string | number; email: string; pgw_id: string };
    onRedirect: (url: string) => void;
    onScriptRun: (script: string) => void;
  }) {
    // const resp = await fetch(`https://gateway.igloorooms.com/IRBE/Generate_Payment_Caller`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': token,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ ...params, callback_url: `https://${app_store.property.perma_link}.bookingmystay.com/invoice` }),
    // });
    // const data = await resp.json();
    const { data } = await axios.post(
      '/Generate_Payment_Caller',
      { ...params, callback_url: generateCheckoutUrl(app_store.property.perma_link) },
      { headers: { Authorization: token } },
    );
    if (data['ExceptionMsg'] !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const res = data['My_Result'];
    if (res.type === 1) {
      onRedirect(res.caller);
    } else {
      onScriptRun(res.caller);
    }
    return res;
  }
  public async RequestBookingCancellation(booking_nbr: string) {
    const { data } = await axios.post(`/Request_Booking_Cancelation`, { BOOK_NBR: booking_nbr });
    if (data['ExceptionMsg'] !== '') {
      throw new Error(data.ExceptionMsg);
    }

    return data['My_Result'];
  }

  public async GetExposedApplicablePolicies({
    params,
    book_date,
  }: {
    params: {
      booking_nbr: string;
      property_id: number;
      room_type_id: number;
      rate_plan_id: number;
      currency_id: number;
      language: number | string;
    };
    book_date: Date;
  }): Promise<TExposedApplicablePolicies> {
    const { data } = await axios.post(`/Get_Exposed_Applicable_Policies`, params);
    if (data['ExceptionMsg'] !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const result = data['My_Result'] as IExposedApplicablePolicies[];
    return { data: result, amount: this.processAlicablePolicies(result, book_date).amount, room_type_id: params.room_type_id, rate_plan_id: params.rate_plan_id };
  }
  public processAlicablePolicies(policies: IExposedApplicablePolicies[], book_date: Date) {
    const guarenteeAmount = policies.find(po => po.type === 'guarantee')?.brackets[0]?.gross_amount || 0;
    let cancelation = policies.find(
      po => po.type === 'cancelation' && po?.brackets?.some(b => isBefore(new Date(b.due_on), book_date) || isSameDay(new Date(b.due_on), book_date)),
    );
    if (cancelation) {
      const cancelationAmount = cancelation.brackets.find(b => isBefore(new Date(b.due_on), book_date) || isSameDay(new Date(b.due_on), book_date))?.gross_amount ?? null;
      return { amount: cancelationAmount > guarenteeAmount ? cancelationAmount : guarenteeAmount };
    }
    return { amount: guarenteeAmount };
  }

  public checkFreeCancelationZone(policies: IExposedApplicablePolicies[]) {
    const now = new Date();
    let isInFreeCancelationZone = false;
    let cancelation = policies?.find(po => po.type === 'cancelation' && po?.brackets?.some(b => isBefore(new Date(b.due_on), now) || isSameDay(new Date(b.due_on), now)));
    if (!cancelation) {
      isInFreeCancelationZone = true;
    }
    return isInFreeCancelationZone;
  }

  public getCancelationMessage(applicablePolicies: IExposedApplicablePolicies[] | null, showCancelation = false, includeGuarentee = true) {
    const cancelationMessage = applicablePolicies.find(t => t.type === 'cancelation')?.combined_statement;
    let message = cancelationMessage ? `${showCancelation ? `<b><u>${localizedWords.entries.Lcz_Cancelation}: </u></b>` : ''}${cancelationMessage}<br/>` : '<span></span>';

    if (includeGuarentee) {
      const guarenteeMessage = applicablePolicies.find(t => t.type === 'guarantee')?.combined_statement;
      if (guarenteeMessage) {
        message += `${showCancelation ? `<b><u>${localizedWords.entries.Lcz_Guarantee}: </u></b>` : ''}${guarenteeMessage}<br/>`;
      }
    }

    return {
      message,
      data: applicablePolicies,
    };
  }

  public async fetchCancelationMessage(params: FetchCancelationMessageParams) {
    let applicablePolicies: IExposedApplicablePolicies[] | null;
    if ('data' in params && params.data) {
      applicablePolicies = params.data;
    } else {
      const { id, roomTypeId, bookingNbr = booking_store.fictus_booking_nbr?.nbr } = params as FetchCancelationMessageWithoutData;
      const result = await this.GetExposedApplicablePolicies({
        book_date: new Date(),
        params: {
          booking_nbr: bookingNbr,
          currency_id: app_store.currencies.find(c => c.code.toLowerCase() === (app_store.userPreferences.currency_id.toLowerCase() || 'usd')).id,
          language: app_store.userPreferences.language_id,
          property_id: app_store.app_data.property_id,
          rate_plan_id: id,
          room_type_id: roomTypeId,
        },
      });
      applicablePolicies = result.data;
    }
    const message = applicablePolicies.find(t => t.type === 'cancelation')?.combined_statement;
    return { message: message ? `${params.showCancelation ? '<b><u>Cancellation: </u></b>' : ''}${message}<br/>` : '<span></span>', data: applicablePolicies };
  }
  public async getBookingPrepaymentAmount(booking: Booking) {
    const list = this.setUpBooking(booking);
    let requests = await Promise.all(
      list.map(l =>
        this.GetExposedApplicablePolicies({
          book_date: new Date(booking.booked_on.date),
          params: {
            booking_nbr: l.booking_nbr,
            currency_id: booking.currency.id,
            language: app_store.userPreferences.language_id,
            rate_plan_id: l.ratePlanId,
            room_type_id: l.roomTypeId,
            property_id: app_store.property.id,
          },
        }),
      ),
    );
    const cancelation_message = requests[0].data.find(t => t.type === 'cancelation')?.combined_statement;
    const guarantee_message = requests[0].data.find(t => t.type === 'guarantee')?.combined_statement;
    const cancelation_policies = requests
      .map((r, idx) => {
        const c_data = r.data.find(f => f.type === 'cancelation');
        const { rp_name, rt_name } = list[idx];
        if (c_data) {
          return { statement: c_data.combined_statement, rp_name, rt_name };
        }
        return null;
      })
      .filter(f => f !== null);
    return { amount: requests.reduce((prev, curr) => prev + curr.amount, 0), cancelation_message, guarantee_message, cancelation_policies };
  }
  private setUpBooking(booking: Booking) {
    let list: { booking_nbr: string; ratePlanId: number; roomTypeId: number; rt_name: string; rp_name: string }[] = [];
    booking.rooms.map(r =>
      list.push({ booking_nbr: booking.booking_nbr, ratePlanId: r.rateplan.id, roomTypeId: r.roomtype.id, rp_name: r.rateplan.name, rt_name: r.roomtype.name }),
    );
    return list;
  }
  public findClosestDate(data: IBrackets[]): IBrackets {
    let closestDateObj: IBrackets | null = null;
    for (const item of data) {
      const currentDueDate = parseISO(item.due_on);
      if (!closestDateObj || isBefore(currentDueDate, parseISO(closestDateObj.due_on))) {
        closestDateObj = item;
      }
    }
    return closestDateObj;
  }
}
