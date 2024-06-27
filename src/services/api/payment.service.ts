import { MissingTokenError, Token } from '@/models/Token';
import axios from 'axios';

export class PaymentService extends Token {
  public async GeneratePaymentCaller(token: string, params: { booking_nbr: string; amount: number; currency_id: string | number; email: string; pgw_id: string }) {
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Generate_Payment_Caller?Ticket=${token}`, params);
    if (data['ExceptionMsg'] !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data['My_Result'];
  }
  public async RequestBookingCancelation(booking_nbr: string) {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Request_Booking_Cancelation?Ticket=${token}`, { booking_nbr });
    if (data['ExceptionMsg'] !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data['My_Result'];
  }
}
