import { MissingTokenError, Token } from '@/models/Token';
import axios from 'axios';

export class PaymentService extends Token {
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
    const { data } = await axios.post(`/Generate_Payment_Caller?Ticket=${token}`, params);
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
}
