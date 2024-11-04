import axios from 'axios';

export class BookingListingService {
  public async getExposedGuestBookings(params: { property_id: string | number; start_row: number; end_row: number; total_count: number; language: string }) {
    const { data } = await axios.post(`/Get_Exposed_Guest_Bookings`, {
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
