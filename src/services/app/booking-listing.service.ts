import { Booking } from '@/models/booking.dto';
import { isBefore } from 'date-fns';
type TBookingActions = {
  cancel: boolean;
  payment: boolean;
};
export class BookingListingAppService {
  public getBookingActions(booking: Booking): TBookingActions {
    const cancel = booking.status.code !== '003' && isBefore(new Date(), new Date(booking.to_date));
    const payment = cancel && booking.financial.due_amount > 0;
    return { cancel, payment };
  }
}
