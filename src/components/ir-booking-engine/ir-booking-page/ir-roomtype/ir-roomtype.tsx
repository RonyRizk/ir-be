import { RoomType } from '@/models/property';
import app_store from '@/stores/app.store';
import booking_store, { getVisibleInventory } from '@/stores/booking';
import localizedWords from '@/stores/localization.store';
import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-roomtype',
  styleUrl: 'ir-roomtype.css',
  shadow: true,
})
export class IrRoomtype {
  @Prop({ reflect: true }) display: 'grid' | 'default' = 'default';
  @Prop() roomtype: RoomType;

  render() {
    return (
      <section class={`room-type-container p-0 ${this.display === 'default' ? 'md:p-4' : 'h-full'}`}>
        {this.display === 'default' && (
          <aside class="hidden md:block">
            <ir-property-gallery property_state="carousel" roomType={this.roomtype}></ir-property-gallery>
          </aside>
        )}
        <div class={`w-full  ${this.display === 'default' ? 'md:space-y-2' : 'rp-container-grid '}`}>
          {/* <div class={'flex flex-1 flex-col'}> */}
          {this.display === 'default' && <h3 class="hidden text-start  text-lg font-medium text-slate-900 md:block ">{this.roomtype.name}</h3>}
          {/* Mobile view for carousel */}
          <div class={this.display === 'default' ? 'md:hidden' : ''}>
            <ir-property-gallery display={this.display} property_state="carousel" roomType={this.roomtype}></ir-property-gallery>
          </div>
          <div class={`p-4 pt-2 ${this.display === 'default' ? 'md:p-0' : 'rp-container-grid '}`}>
            <div>
              <h3 class={`text-start  text-lg font-medium text-slate-900 ${this.display === 'default' ? 'md:hidden' : ''} `}>{this.roomtype.name}</h3>
              <div class={`flex  flex-wrap  gap-2 py-2 text-sm font-normal text-gray-700 ${this.display === 'default' ? 'md:hidden' : '  '}`}>
                <ir-accomodations
                  bookingAttributes={{
                    max_occupancy: this.roomtype.occupancy_max.adult_nbr,
                    bedding_setup: this.roomtype.bedding_setup,
                  }}
                  amenities={app_store.property.amenities}
                ></ir-accomodations>
              </div>
              {this.display === 'default' && (
                <div class={'hidden md:block'}>
                  <ir-accomodations
                    bookingAttributes={{
                      max_occupancy: this.roomtype.occupancy_max.adult_nbr,
                      bedding_setup: this.roomtype.bedding_setup,
                    }}
                    amenities={app_store.property.amenities}
                  ></ir-accomodations>
                </div>
              )}
            </div>
            {/* </div> */}
            {this.roomtype.rateplans.every(r => r.is_closed) ? (
              <p class={`unavailable-roomtype text-base ${this.display === 'default' ? '' : 'pt-4'}`}>{localizedWords.entries.Lcz_NotAvailable}</p>
            ) : (
              <div>
                {booking_store.enableBooking ? (
                  this.roomtype.rateplans.map(ratePlan => {
                    if (!ratePlan.is_active || ratePlan.is_closed || !ratePlan.is_booking_engine_enabled || !ratePlan.variations) {
                      return null;
                    }
                    const visibleInventory = getVisibleInventory(this.roomtype.id, ratePlan.id);
                    return (
                      <ir-rateplan
                        display={this.display}
                        key={ratePlan.id}
                        ratePlan={ratePlan}
                        visibleInventory={visibleInventory}
                        roomTypeId={this.roomtype.id}
                        roomTypeInventory={this.roomtype.inventory}
                      ></ir-rateplan>
                    );
                  })
                ) : (
                  <div class="app_container flex w-full  flex-col justify-between space-y-1 rounded-md bg-gray-100  text-sm md:flex-row">
                    <p>{this.roomtype.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
}
