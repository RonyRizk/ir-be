import { Booking } from '@/models/booking.dto';
import { IBrackets, IExposedApplicablePolicies } from '@/models/property';
import app_store from '@/stores/app.store';
import booking_store from '@/stores/booking';
import localizedWords from '@/stores/localization.store';
import { generateCheckoutUrl } from '@/utils/utils';
import axios from 'axios';
import { isBefore, isSameDay, parseISO } from 'date-fns';
import moment from 'moment';

type TExposedApplicablePolicies = { data: IExposedApplicablePolicies[]; amount: number; room_type_id?: number; rate_plan_id?: number };
interface FetchCancellationMessageWithData {
  data: IExposedApplicablePolicies[];
  showCancelation?: boolean;
}

interface FetchCancellationMessageWithoutData {
  id: number;
  roomTypeId: number;
  bookingNbr?: string;
  showCancelation?: boolean;
  data?: null;
}

type FetchCancellationMessageParams = FetchCancellationMessageWithData | FetchCancellationMessageWithoutData;
export type TBookingInfo = { statement: string; rp_name: string; rt_name: string };
export class PaymentService {
  public async getExposedCancellationDueAmount(params: { booking_nbr: string; currency_id: number }) {
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
  public async requestBookingCancellation(booking_nbr: string) {
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
    return { data: result, amount: this.processApplicablePolicies(result, book_date).amount, room_type_id: params.room_type_id, rate_plan_id: params.rate_plan_id };
  }
  public processApplicablePolicies(policies: IExposedApplicablePolicies[], book_date: Date) {
    const guaranteeAmount = policies.find(po => po.type === 'guarantee')?.brackets[0]?.gross_amount || 0;
    let cancellation = policies.find(
      po => po.type === 'cancelation' && po?.brackets?.some(b => isBefore(new Date(b.due_on), book_date) || isSameDay(new Date(b.due_on), book_date)),
    );
    if (cancellation) {
      const cancellationAmount = cancellation.brackets.find(b => isBefore(new Date(b.due_on), book_date) || isSameDay(new Date(b.due_on), book_date))?.gross_amount ?? null;
      return { amount: cancellationAmount > guaranteeAmount ? cancellationAmount : guaranteeAmount };
    }
    return { amount: guaranteeAmount };
  }
  /**
   * Determines whether the current time falls within a "free cancellation" bracket.
   *
   * The method identifies which cancellation bracket (based on `due_on` date)
   * the current time is within. A bracket is defined by a start date (`due_on`)
   * and ends at the start of the next bracket (or continues indefinitely if it's the last one).
   *
   * If the current bracket has an `amount` or `gross_amount` equal to `0`,
   * the booking is considered to be in the free cancellation period.
   *
   * @param {IExposedApplicablePolicies[]} policies - List of applicable policies containing cancellation brackets.
   * @returns {boolean} Returns `true` if currently in a free cancellation bracket (amount = 0), otherwise `false`.
   *
   * @example
   * const isFree = paymentService.checkFreeCancellationZone(policies);
   * if (isFree) {
   *   console.log('You are within the free cancellation period.');
   * }
   */
  public checkFreeCancellationZone(policies: IExposedApplicablePolicies[]): boolean {
    const cancellationPolicies = policies.find(p => p.type === 'cancelation');
    if (!cancellationPolicies || !Array.isArray(cancellationPolicies.brackets) || cancellationPolicies.brackets.length === 0) {
      return false;
    }

    const now = moment();

    // Ensure brackets are in ascending order by start date
    const brackets = [...cancellationPolicies.brackets].sort((a, b) => moment(a.due_on, 'YYYY-MM-DD').valueOf() - moment(b.due_on, 'YYYY-MM-DD').valueOf());

    // Find the bracket where: start <= now < nextStart (or open-ended if last)
    let currentBracket: IBrackets | null = null;
    for (let i = 0; i < brackets.length; i++) {
      const start = moment(brackets[i].due_on, 'YYYY-MM-DD');
      const nextStart = i < brackets.length - 1 ? moment(brackets[i + 1].due_on, 'YYYY-MM-DD') : null;

      if (now.isSameOrAfter(start) && (nextStart === null || now.isBefore(nextStart))) {
        currentBracket = brackets[i];
        break;
      }
    }

    if (!currentBracket) {
      // now is before the first bracket's start; by definition we're not inside any bracket
      return true;
    }

    const amt = currentBracket.gross_amount ?? 0;

    return Number(amt) === 0;
  }

  public getCancellationMessage(applicablePolicies: IExposedApplicablePolicies[] | null, showCancellation = false, includeGuarantee = true) {
    const cancellationMessage = applicablePolicies.find(t => t.type === 'cancelation')?.combined_statement;
    let message = cancellationMessage ? `${showCancellation ? `<b><u>${localizedWords.entries.Lcz_Cancelation}: </u></b>` : ''}${cancellationMessage}<br/>` : '<span></span>';

    if (includeGuarantee) {
      const guaranteeMessage = applicablePolicies.find(t => t.type === 'guarantee')?.combined_statement;
      if (guaranteeMessage) {
        message += `${showCancellation ? `<b><u>${localizedWords.entries.Lcz_Guarantee}: </u></b>` : ''}${guaranteeMessage}<br/>`;
      }
    }

    return {
      message,
      data: applicablePolicies,
    };
  }

  public async fetchCancellationMessage(params: FetchCancellationMessageParams) {
    let applicablePolicies: IExposedApplicablePolicies[] | null;
    if ('data' in params && params.data) {
      applicablePolicies = params.data;
    } else {
      const { id, roomTypeId, bookingNbr = booking_store.fictus_booking_nbr?.nbr } = params as FetchCancellationMessageWithoutData;
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
