import { Component, Prop, h } from '@stencil/core';
import { Amenity, RoomType } from '@/models/property';
import localizedWords from '@/stores/localization.store';
@Component({
  tag: 'ir-room-type-amenities',
  styleUrl: 'ir-room-type-amenities.css',
  shadow: true,
})
export class IrRoomTypeAmenities {
  @Prop() aminities: Amenity[];
  @Prop() roomType: RoomType;
  renderOccupancyView() {
    const { adult_nbr, children_nbr } = this.roomType.occupancy_max;
    const maxNumber = adult_nbr + children_nbr;

    const renderOccupancy = () => (
      <div class="flex items-end">
        <div class="flex items-center">
          <ir-icons svgClassName="size-3" name="user"></ir-icons>
          <p>{adult_nbr}</p>
        </div>
        {children_nbr > 0 && (
          <div class="flex items-center gap-2">
            <ir-icons svgClassName="size-3" name="child"></ir-icons>
            <p>{children_nbr}</p>
          </div>
        )}
      </div>
    );
    if (maxNumber > 7) {
      return (
        <div class="flex w-full items-center justify-between text-sm">
          <div class="flex items-center gap-2">
            <p>{localizedWords.entries.Lcz_Maximum}</p>
            {renderOccupancy()}
          </div>
        </div>
      );
    }

    return (
      <div class="flex w-full items-center justify-between text-sm">
        <div class="flex items-center gap-2">
          <p>{localizedWords.entries.Lcz_Maximum}</p>
          <div class="flex items-center">
            {[...Array(adult_nbr)].map((_, i) => (
              <ir-icons svgClassName="size-3" key={i} name="user"></ir-icons>
            ))}
          </div>
        </div>
      </div>
    );
  }
  render() {
    return (
      <div class="space-y-3">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div class=" flex items-center gap-4">
            {this.roomType.size > 0 && (
              <div class="flex items-center gap-2">
                <ir-icons name="dimensions"></ir-icons>
                <p>
                  {this.roomType.size}{' '}
                  <span class="ordinal">
                    m<sup>2</sup>
                  </span>
                </p>
              </div>
            )}{' '}
            <div class="flex items-center gap-2">
              <ir-icons name="wifi"></ir-icons>
              <p>{this.aminities?.some(amenity => amenity.amenity_type === 'room' && amenity.code === 'freewifi') ? localizedWords.entries.Lcz_wifi : ''} </p>
              {/* <p>Free Wifi</p> */}
            </div>
          </div>

          <div class="flex items-center gap-4">
            {/* <div class="flex items-center gap-2">
              <ir-icons name="user_group"></ir-icons>
              <p>Sleeps {this.roomType.occupancy_max.adult_nbr}</p>
            </div> */}
            <div class="flex items-center gap-2">
              <ir-icons name="bed"></ir-icons>
              {this.roomType?.bedding_setup?.map((bed_setup, index) => (
                <p key={bed_setup.code}>
                  {bed_setup.name} {index < this.roomType.bedding_setup.length - 1 && <span> - </span>}
                </p>
              ))}
            </div>
          </div>
        </div>
        {this.roomType.images.length === 0 && (
          <div class="flex flex-1 items-center gap-4">
            <div class="flex items-center gap-2">{this.renderOccupancyView()}</div>
          </div>
        )}
        <p innerHTML={this.roomType?.description} class="py-4"></p>
        <h3 class="text-lg font-medium text-gray-800">{localizedWords.entries.Lcz_Amenities}</h3>
        <ul class="grid grid-cols-2 gap-4 pb-6 text-xs sm:text-sm lg:grid-cols-3">
          {this.aminities.map(aminity => {
            if (aminity.amenity_type !== 'room') {
              return null;
            }
            return (
              <li class="ml-4 flex items-center gap-4" key={aminity.code}>
                <ir-icons name="check" svgClassName="size-3"></ir-icons>
                <span>{aminity.description}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
