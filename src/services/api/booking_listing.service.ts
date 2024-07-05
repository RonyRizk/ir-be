import { MissingTokenError, Token } from '@/models/Token';
import axios from 'axios';

export class BookingListingService extends Token {
  public async getExposedGuestBookings(params: { property_id: string | number; start_row: number; end_row: number; total_count: number }) {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Get_Exposed_Guest_Bookings?Ticket=${token}`, {
      ...params,
      extras: [
        {
          key: 'payment_code',
          value: '',
        },
        {
          key: 'prepayment_amount',
          value: '',
        },
      ],
    });
    if (data['ExceptionMsg'] !== '') {
      throw new Error(data['ExceptionMsg']);
    }
    return { bookings: data['My_Result'], total_count: data['My_Params_Get_Exposed_Guest_Bookings'].total_count };
  }
}
