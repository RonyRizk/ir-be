import { IExposedApplicablePolicies } from '@/models/property';
import { MissingTokenError, Token } from '@/models/Token';
import app_store from '@/stores/app.store';
import axios from 'axios';
import { isBefore } from 'date-fns';

export class PaymentService extends Token {
  public processBookingPayment() {}
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
  }) {
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Get_Exposed_Applicable_Policies?Ticket=${token}`, params);
    if (data['ExceptionMsg'] !== '') {
      throw new Error(data.ExceptionMsg);
    }
    const result = data['My_Result'];
    return { data: result, amount: this.processAlicablePolicies(result, book_date) };
  }
  private processAlicablePolicies(policies: IExposedApplicablePolicies[], book_date: Date) {
    const guarenteeAmount = policies.find(po => po.type === 'guarantee')?.brackets[0]?.gross_amount || 0;
    let cancelation = policies.find(po => po.type === 'cancelation' && po.brackets.some(b => isBefore(new Date(b.due_on), book_date)));
    console.log('cancelation', cancelation);
    if (cancelation) {
      const cancelationAmount = cancelation.brackets.find(b => isBefore(new Date(b.due_on), book_date))?.gross_amount ?? null;
      return cancelationAmount > guarenteeAmount ? cancelationAmount : guarenteeAmount;
    }
    return guarenteeAmount;
  }
}
