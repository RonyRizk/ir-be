import { CheckoutErrors, pages } from '@/models/commun';
import app_store from '@/stores/app.store';
import booking_store, { calculateTotalCost } from '@/stores/booking';
import { checkout_store } from '@/stores/checkout.store';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import localizedWords from '@/stores/localization.store';
import { formatAmount, getDateDifference } from '@/utils/utils';
import { Component, Host, h, Event, EventEmitter, Prop } from '@stencil/core';
import { format } from 'date-fns';
import localization_store from '@/stores/app.store';
@Component({
  tag: 'ir-booking-summary',
  styleUrl: 'ir-booking-summary.css',
  shadow: true,
})
export class IrBookingSummary {
  @Prop() prepaymentAmount = null;

  @Event() routing: EventEmitter<pages>;
  @Event() bookingClicked: EventEmitter<null>;
  @Event() openPrivacyPolicy: EventEmitter<null>;

  @Prop() error: CheckoutErrors;
  handleBooking() {
    this.bookingClicked.emit(null);
  }

  render() {
    const total_nights = getDateDifference(booking_store.bookingAvailabilityParams.from_date ?? new Date(), booking_store.bookingAvailabilityParams.to_date ?? new Date());
    const { totalAmount } = calculateTotalCost(true);
    console.log(totalAmount);
    console.log(booking_store.ratePlanSelections);
    if (isRequestPending('/Get_Setup_Entries_By_TBL_NAME_MULTI')) {
      return (
        <div>
          <p>Loading</p>
        </div>
      );
    }
    return (
      <Host>
        <div class="w-full rounded-md bg-gray-100  text-sm md:max-w-sm">
          {app_store.property?.space_theme.background_image && (
            <div class="aspect-[1/1] max-h-32 w-full lg:aspect-[16/9]">
              <img class="h-full w-full rounded-t-md object-cover" src={app_store.property?.images[0].url} alt={app_store.property?.images[0].tooltip} />
            </div>
          )}
          <section class="flex flex-col items-center space-y-4 p-4 lg:p-6">
            {/* <h3 class="text-center  text-lg font-medium">{app_store.property?.name}</h3> */}
            <div class="flex w-full flex-1 items-center ">
              <div class="w-56 rounded-md border border-gray-300 bg-white p-2 text-center text-xs">
                <p>{localizedWords.entries.Lcz_CheckIn}</p>
                <p class="text-sm font-semibold">
                  {format(booking_store.bookingAvailabilityParams?.from_date ? new Date(booking_store.bookingAvailabilityParams?.from_date) : new Date(), 'eee, dd MMM yyyy', {
                    locale: localization_store.selectedLocale,
                  })}
                </p>
                <p>
                  {localizedWords.entries.Lcz_From} {app_store.property?.time_constraints.check_in_from}
                </p>
              </div>
              <div class="h-[1px] w-full min-w-[1rem] flex-1 bg-gray-300 "></div>
              <div class="w-56 rounded-md border border-gray-300 bg-white p-2 text-center text-xs">
                <p>{localizedWords.entries.Lcz_CheckOut}</p>
                <p class="text-sm font-semibold">
                  {format(booking_store.bookingAvailabilityParams?.to_date ? new Date(booking_store.bookingAvailabilityParams?.to_date) : new Date(), 'eee, dd MMM yyyy', {
                    locale: localization_store.selectedLocale,
                  })}
                </p>
                <p>
                  {localizedWords.entries.Lcz_Before} {app_store.property?.time_constraints.check_out_till}
                </p>
              </div>
            </div>

            <ir-button onButtonClick={() => this.routing.emit('booking')} label={localizedWords.entries.Lcz_ChangeDetails} variants="outline" class="w-full"></ir-button>
            <div class={'mt-4  w-full'}>
              <ul class={'w-full space-y-2'}>
                <li class={'flex w-full items-center justify-between'}>
                  <span>
                    {total_nights} {total_nights > 1 ? localizedWords.entries.Lcz_Nights : localizedWords.entries.Lcz_night}
                  </span>
                  <span>{formatAmount(totalAmount, app_store.userPreferences.currency_id)}</span>
                </li>
                {checkout_store.pickup?.location && (
                  <li class={'flex w-full items-center justify-between'}>
                    <span>{localizedWords.entries.Lcz_PickupFee}</span>
                    <span>{formatAmount(checkout_store.pickup.location ? Number(checkout_store.pickup.due_upon_booking) : 0, app_store.userPreferences.currency_id)}</span>
                  </li>
                )}
                <li class={'flex w-full items-center justify-between'}>
                  <span>{localizedWords.entries.Lcz_Total}</span>
                  <span class="text-lg font-medium">
                    {formatAmount(totalAmount + (checkout_store.pickup.location ? Number(checkout_store.pickup.due_upon_booking) : 0), app_store.userPreferences.currency_id)}
                  </span>
                </li>
                <li class={'flex w-full items-center justify-between pt-1'}>
                  <span>{localizedWords.entries.Lcz_PayNow}</span>
                  <span class="text-base">{formatAmount(this.prepaymentAmount, app_store.userPreferences.currency_id)}</span>
                </li>
              </ul>
            </div>
            <ir-payment-view
              class="w-full"
              prepaymentAmount={this.prepaymentAmount}
              errors={this.error && this.error.cause === 'payment' ? this.error.issues : undefined}
            ></ir-payment-view>
            <div class="w-full space-y-1">
              <div class={'flex w-full items-center gap-1'}>
                <ir-checkbox
                  label={localizedWords.entries.Lcz_IAgreeToThe}
                  checked={checkout_store.agreed_to_services}
                  onCheckChange={e => (checkout_store.agreed_to_services = e.detail)}
                ></ir-checkbox>

                {/* <ir-privacy-policy
                  class=" flex-1"
                  label={`${localizedWords.entries.Lcz_PrivacyPolicy}.`}
                  policyTriggerStyle={{ color: 'inherit', textDecoration: 'underline' }}
                  id="checkout-policy"
                ></ir-privacy-policy> */}
                <span class={'flex-1 cursor-pointer underline'} onClick={() => this.openPrivacyPolicy.emit(null)}>
                  {localizedWords.entries.Lcz_PrivacyPolicy}
                </span>
              </div>
              {this.error?.cause === 'booking-summary' && !checkout_store.agreed_to_services && (
                <p class="text-sm text-red-500">{localizedWords.entries.Lcz_YouMustAcceptPrivacyPolicy}//you must first</p>
              )}
            </div>
            <ir-button
              isLoading={isRequestPending('/DoReservation')}
              size="md"
              class="w-full"
              label={localizedWords.entries.Lcz_ConfirmBooking}
              onButtonClick={this.handleBooking.bind(this)}
            ></ir-button>
          </section>
        </div>
      </Host>
    );
  }
}
