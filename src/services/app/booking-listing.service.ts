import { Booking } from '@/models/booking.dto';
import app_store from '@/stores/app.store';
import localizedWords from '@/stores/localization.store';
import { formatAmount } from '@/utils/utils';
import { isBefore } from 'date-fns';
type TBookingActions = {
  cancel: { show: boolean; label: string };
  payment: { show: boolean; label: string; formattedAmount: string };
  view: { show: boolean; label: string };
};
export class BookingListingAppService {
  public detectPaymentOrigin(booking: Booking) {
    console.log(booking.extras);
    if (!booking.extras) {
      return null;
    }
    const code = booking.extras.find(e => e.key === 'payment_code')?.value;
    if (!code) {
      return null;
    }
    return app_store.property.allowed_payment_methods.find(apm => apm.code === code) ?? null;
  }

  public getBookingActions(booking: Booking): TBookingActions {
    // const canView = booking.status.code !== '003';
    const canView = true;
    const canCancel = booking.status.code !== '003' && isBefore(new Date(), new Date(booking.from_date)) && !booking.is_requested_to_cancel;
    const canMakePayment = booking.status.code === '001' && app_store.property.allowed_payment_methods.some(paymentMethod => paymentMethod.is_payment_gateway);
    let makePaymentLabel = '';
    let formattedAmount = '';
    if (canMakePayment) {
      const prepayment_amount = booking.extras.find(e => e.key === 'prepayment_amount');
      if (prepayment_amount) {
        formattedAmount = formatAmount(prepayment_amount.value || 0, booking.currency.code);
        makePaymentLabel = localizedWords.entries.Lcz_PayToGuarantee.replace('%1', formattedAmount);
      }
    }
    return {
      cancel: { show: canCancel, label: localizedWords.entries.Lcz_CancelBooking },
      payment: { show: canMakePayment, label: makePaymentLabel, formattedAmount },
      view: { show: canView, label: localizedWords.entries.Lcz_BookingDetails },
    };
  }
}
