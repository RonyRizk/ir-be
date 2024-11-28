import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
import app_store from '@/stores/app.store';
import localizedWords from '@/stores/localization.store';
import { format } from 'date-fns';
import { formatAmount, getDateDifference } from '@/utils/utils';
import { BookingListingAppService } from '@/services/app/booking-listing.service';

@Component({
  tag: 'ir-booking-details-view',
  styleUrl: 'ir-booking-details-view.css',
  shadow: true,
})
export class IrBookingDetailsView {
  @Prop({ mutable: true }) booking: Booking | null = null;
  @Event() bl_routing: EventEmitter<{
    route: 'booking' | 'booking-details';
    params?: unknown;
  }>;
  private bookingCancelation: HTMLIrBookingCancellationElement;
  private bookingListingAppService = new BookingListingAppService();
  private email: string;

  componentWillLoad() {
    const { email } = app_store.property?.contacts?.find(c => c.type === 'booking');
    this.email = email;
  }

  renderBookingDetailHeader() {
    const total_nights = getDateDifference(new Date(this.booking.from_date), new Date(this.booking.to_date));
    const nbr_of_persons = this.booking.occupancy.adult_nbr + this.booking.occupancy.children_nbr;
    const total_rooms = this.booking.rooms.length;
    return `${total_nights} ${total_nights > 1 ? localizedWords.entries.Lcz_Nights : localizedWords.entries.Lcz_night} - ${nbr_of_persons}
    ${nbr_of_persons > 1 ? localizedWords.entries.Lcz_Persons : localizedWords.entries.Lcz_Person} - ${total_rooms}
    ${total_rooms > 1 ? localizedWords.entries.Lcz_Rooms : localizedWords.entries.Lcz_Room}`;
  }

  renderLocation() {
    const { city, country, area, address } = app_store.property;
    return [address ?? null, area ?? null, city.name ?? null, country.name ?? null].filter(f => f !== null).join(', ');
  }

  renderPropertyEmail() {
    if (!this.email) {
      return null;
    }
    return (
      <div class="booking-info-text">
        Email:
        <span>
          <a href={`mailto:${this.email}`} class="contact-link">
            {this.email}
          </a>
        </span>
      </div>
    );
  }

  formatGuest() {
    const values = [this.email, `${app_store.property?.country?.phone_prefix || ''} ${app_store.property?.phone}`];
    return localizedWords.entries.Lcz_GuestService_ContactUs?.replace(/{(\d+)}/g, (match, number) => {
      return typeof values[number] !== 'undefined' ? values[number] : match;
    });
  }

  render() {
    if (!this.booking) {
      return null;
    }
    const { cancel } = this.bookingListingAppService.getBookingActions(this.booking);
    return (
      <div class="booking-details-container text-sm">
        <div class="header">
          <div class="header-left">
            <ir-button
              variants="icon"
              onButtonClick={e => {
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.bl_routing.emit({ route: 'booking' });
              }}
              iconName={app_store.dir === 'RTL' ? 'angle_right' : ('angle_left' as any)}
            ></ir-button>
            <p class="header-title">{localizedWords.entries.Lcz_MyBookings}</p>
          </div>
          {cancel && <ir-button label="Cancel Request" class="cancel-button" onButtonClick={() => this.bookingCancelation.openDialog()}></ir-button>}
        </div>

        <h2 class="section-title">
          {localizedWords.entries.Lcz_BookingReference} {this.booking.booking_nbr} - {app_store.property.name}
        </h2>
        <section class="detail-container">
          <div class="details-section">
            <div>
              <p class="booking-info-text">
                {localizedWords.entries.Lcz_BookedBy}{' '}
                <span>
                  {this.booking.guest.first_name} {this.booking.guest.last_name}
                </span>
              </p>
              <p class="booking-info-text">
                {localizedWords.entries.Lcz_CheckIn}: <span>{format(this.booking.from_date, 'eee, dd MMM yyyy')} </span>
                <span>
                  {localizedWords.entries.Lcz_From} {app_store.property?.time_constraints.check_in_from}
                </span>
              </p>
              <p class="booking-info-text">
                {localizedWords.entries.Lcz_CheckOut}: <span>{format(this.booking.to_date, 'eee, dd MMM yyyy')} </span>
                <span>
                  {localizedWords.entries.Lcz_Before} {app_store.property?.time_constraints.check_out_till}
                </span>
              </p>
              <p class="booking-info-text">
                {localizedWords.entries.Lcz_ArrivalTime} <span>{this.booking.arrival.description}</span>
              </p>
              {this.booking.remark && (
                <p class="booking-info-text">
                  Special request: <span>{this.booking.remark}</span>
                </p>
              )}
            </div>
            <div>
              <p class="booking-info-text">
                Address:
                <span> {this.renderLocation()}</span>
              </p>
              <p class="booking-info-text">
                GPS:
                <span>
                  {' '}
                  Latitude {app_store.property.location.latitude}, Longitude {app_store.property.location.longitude}
                </span>
              </p>
              <p class="booking-info-text">
                Phone:{' '}
                <span>
                  {' '}
                  <a class="contact-link" href={`tel:${app_store.property?.phone}`}>
                    {app_store.property?.country?.phone_prefix || ''} {app_store.property?.phone}
                  </a>
                </span>
              </p>
              {this.renderPropertyEmail()}
            </div>
          </div>
          <div class="booking-details">
            <div class="booking-header">
              <div class="header-left">
                <ir-icons name="bed"></ir-icons>
                <h3 class="booking-header-title">{this.renderBookingDetailHeader()}</h3>
              </div>
              <p>{app_store.property?.tax_statement}</p>
            </div>

            <div>
              {this.booking.rooms?.map(room => (
                <div class="room-info" key={room.identifier}>
                  <div class="room-header">
                    <h4 class="room-type">{room.roomtype.name}</h4>
                    <p class="room-price">{formatAmount(room.gross_total, this.booking.currency.code)}</p>
                  </div>
                  <p class="room-info-text">
                    {localizedWords.entries.Lcz_GuestName}{' '}
                    <span>
                      {room.guest.first_name} {room.guest.last_name} ({room.rateplan.selected_variation.adult_child_offering})
                    </span>
                  </p>
                  <p class="room-info-text">
                    {localizedWords.entries.Lcz_MealPlan} <span>{room.rateplan.name}</span>
                  </p>
                  <p class="room-info-text" innerHTML={room.rateplan.cancelation}></p>
                  <p class="room-info-text" innerHTML={room.rateplan.guarantee}></p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section class="hotel-policies">
          <h2 class="section-title">Hotel Policies</h2>
          <ir-facilities></ir-facilities>
        </section>
        <section class="payment-details">
          <h2 class="section-title">Payment Details</h2>
          <div class="detail-container">
            <p>{localizedWords.entries.Lcz_YourBookingIsGuaranteed}</p>
            <p>{localizedWords.entries.Lcz_YourBookingIsNotGuaranteed}</p>
          </div>
        </section>
        <section class="guest-service">
          <h2 class="section-title">Guest Service</h2>
          <p class="detail-container" innerHTML={this.formatGuest()}></p>
        </section>
        <ir-booking-cancellation
          ref={el => (this.bookingCancelation = el)}
          booking_nbr={this.booking?.booking_nbr}
          cancellation={this.booking?.rooms[0].rateplan.cancelation}
          onCancellationResult={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            const { state } = e.detail;
            if (state === 'success') {
              this.booking = { ...this.booking, status: { code: '003', description: 'Cancelled' } };
            }
          }}
        ></ir-booking-cancellation>
      </div>
    );
  }
}
