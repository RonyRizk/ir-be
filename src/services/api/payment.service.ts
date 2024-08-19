import { Booking } from '@/models/booking.dto';
import { IBrackets, IExposedApplicablePolicies } from '@/models/property';
import { MissingTokenError, Token } from '@/models/Token';
import app_store from '@/stores/app.store';
import booking_store from '@/stores/booking';
import axios from 'axios';
import { isBefore, parseISO } from 'date-fns';

type TExposedApplicablePolicies = { data: IExposedApplicablePolicies[]; amount: number };
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
export class PaymentService extends Token {
  public async getExposedCancelationDueAmount(params: { booking_nbr: string; currency_id: number }) {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Get_Exposed_Cancelation_Due_Amount?Ticket=${token}`, {
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
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Generate_Payment_Caller?Ticket=${token}`, {
      ...params,
      callback_url: `https://${app_store.property.perma_link}.bookingmystay.com/invoice`,
    });
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
  public async RequestBookingCancelation(booking_nbr: string) {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Request_Booking_Cancelation?Ticket=${token}`, { BOOK_NBR: booking_nbr });
    if (data['ExceptionMsg'] !== '') {
      throw new Error(data.ExceptionMsg);
    }

    return data['My_Result'];
  }

  public async GetExposedApplicablePolicies({
    token,
    params,
    book_date,
  }: {
    token: string;
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
    if (!token) {
      throw new MissingTokenError();
    }
    console.log('here');
    const { data } = await axios.post(`/Get_Exposed_Applicable_Policies?Ticket=${token}`, params);
    if (data['ExceptionMsg'] !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const result = data['My_Result'] as IExposedApplicablePolicies[];
    return { data: result, amount: this.processAlicablePolicies(result, book_date).amount };
  }
  public processAlicablePolicies(policies: IExposedApplicablePolicies[], book_date: Date) {
    let isInFreeCancelationZone = false;
    const guarenteeAmount = policies.find(po => po.type === 'guarantee')?.brackets[0]?.gross_amount || 0;
    let cancelation = policies.find(po => po.type === 'cancelation' && po?.brackets?.some(b => isBefore(book_date, new Date(b.due_on)), book_date));
    if (cancelation) {
      isInFreeCancelationZone = true;
      const cancelationAmount = cancelation.brackets.find(b => isBefore(new Date(b.due_on), book_date))?.gross_amount ?? null;
      return { amount: cancelationAmount > guarenteeAmount ? cancelationAmount : guarenteeAmount, isInFreeCancelationZone };
    }
    return { amount: guarenteeAmount, isInFreeCancelationZone };
  }
  public async fetchCancelationMessage(params: FetchCancelationMessageParams) {
    let applicablePolicies: IExposedApplicablePolicies[] | null;
    if ('data' in params && params.data) {
      applicablePolicies = params.data;
    } else {
      console.log('fetching cancelation message');
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
        token: app_store.app_data.token,
      });
      applicablePolicies = result.data;
    }
    const message = applicablePolicies.find(t => t.type === 'cancelation')?.combined_statement;
    return { message: message ? `${params.showCancelation ? '<b><u>Cancellation: </u></b>' : ''}${message}<br/>` : '<span></span>', data: applicablePolicies };
  }
  public async getBookingPrepaymentAmount(booking: Booking) {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const list = this.setUpBooking(booking);
    let requests = await Promise.all(
      list.map(l =>
        this.GetExposedApplicablePolicies({
          token,
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
