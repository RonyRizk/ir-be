import { RoomType } from '@/models/property';
import app_store from '@/stores/app.store';
import booking_store, { getVisibleInventory } from '@/stores/booking';
import localizedWords from '@/stores/localization.store';
// import { passedBookingCutoff } from '@/utils/utils';
import { Component, Fragment, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-roomtype',
  styleUrl: 'ir-roomtype.css',
  shadow: true,
})
export class IrRoomtype {
  @Prop({ reflect: true }) display: 'grid' | 'default' = 'default';
  @Prop() roomtype: RoomType;

  @State() shouldHideMlsRateplans: boolean;

  componentWillLoad() {
    this.checkRateplans();
  }

  @Watch('roomtype')
  handleRoomTypeChange() {
    this.checkRateplans();
  }

  private checkRateplans() {
    this.shouldHideMlsRateplans =
      this.roomtype.rateplans.some(rp => rp.not_available_reason?.includes('MLS')) && // Check for MLS issues
      this.roomtype.rateplans.some(rp => rp.is_available_to_book); // Check for available rate plans
  }

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
            {/* {passedBookingCutoff() ? (
              <p class={`unavailable-roomtype text-base ${this.display === 'default' ? '' : 'pt-4'}`}>{localizedWords.entries.Lcz_NotAvailable}</p>
            ) : ( */}
            <Fragment>
              {booking_store.enableBooking ? (
                this.roomtype.is_available_to_book ||
                (!this.roomtype.is_available_to_book && this.roomtype?.rateplans?.some(rp => !rp.is_available_to_book && rp.not_available_reason?.includes('MLS'))) ? (
                  <div>
                    {this.roomtype?.rateplans?.map(ratePlan => {
                      if (!ratePlan.is_available_to_book && !ratePlan.not_available_reason?.includes('MLS')) {
                        return null;
                      }
                      if (ratePlan.not_available_reason?.includes('MLS') && this.shouldHideMlsRateplans) {
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
                    })}
                  </div>
                ) : (
                  <p class={`unavailable-roomtype text-base ${this.display === 'default' ? '' : 'pt-4'}`}>{localizedWords.entries.Lcz_NotAvailable}</p>
                )
              ) : (
                <div class="app_container flex w-full  flex-col justify-between space-y-1 rounded-md bg-gray-100  text-sm md:flex-row">
                  <p innerHTML={this.roomtype.description}></p>
                </div>
              )}
            </Fragment>
            {/* )} */}
          </div>
        </div>
      </section>
    );
  }
}
