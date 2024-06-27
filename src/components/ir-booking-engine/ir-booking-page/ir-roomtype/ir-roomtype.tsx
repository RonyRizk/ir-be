import { RoomType } from '@/models/property';
import app_store from '@/stores/app.store';
import booking_store, { getVisibleInventory } from '@/stores/booking';
import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-roomtype',
  styleUrl: 'ir-roomtype.css',
  shadow: true,
})
export class IrRoomtype {
  @Prop() roomtype: RoomType;

  render() {
    return (
      <section class="room-type-container">
        <aside class="hidden md:block">
          <ir-property-gallery property_state="carousel" roomType={this.roomtype}></ir-property-gallery>
        </aside>
        <div class="w-full flex-1 space-y-2">
          <h3 class="text-start text-lg  font-medium text-slate-900 ">{this.roomtype.name}</h3>
          {/* Mobile view for carousel */}
          <div class="md:hidden">
            <ir-property-gallery property_state="carousel" roomType={this.roomtype}></ir-property-gallery>
          </div>
          <div class="hidden md:block">
            <ir-accomodations
              bookingAttributes={{
                max_occupancy: this.roomtype.occupancy_max.adult_nbr,
                bedding_setup: this.roomtype.bedding_setup,
              }}
              amenities={app_store.property.amenities}
            ></ir-accomodations>
          </div>

          {booking_store.enableBooking ? (
            this.roomtype.rateplans.map(ratePlan => {
              if (!ratePlan.is_active || !ratePlan.is_booking_engine_enabled || !ratePlan.variations) {
                return null;
              }

              const visibleInventory = getVisibleInventory(this.roomtype.id, ratePlan.id);
              return (
                <ir-rateplan
                  key={ratePlan.id}
                  ratePlan={ratePlan}
                  visibleInventory={visibleInventory}
                  roomTypeId={this.roomtype.id}
                  roomTypeInventory={this.roomtype.inventory}
                ></ir-rateplan>
              );
            })
          ) : (
            <div class="app_container flex w-full flex-1 flex-col justify-between space-y-1 rounded-md bg-gray-100  text-sm md:flex-row">
              <p>{this.roomtype.description}</p>
            </div>
          )}
        </div>
      </section>
    );
  }
}
