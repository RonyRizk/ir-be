import axios from 'axios';

export class BookingService {
  public async GetPenaltyStatement(params: { booking_nbr: string; currency_id: number; language: string }) {
    const { data } = await axios.post('/Get_Penalty_Statement', params);
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result;
  }
}
