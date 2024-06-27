import { Component, Prop, h } from '@stencil/core';
import { Amenity, BeddingSetup } from '@/models/property';
@Component({
  tag: 'ir-accomodations',
  styleUrl: 'ir-accomodations.css',
  shadow: true,
})
export class IrAccomodations {
  @Prop() amenities: Amenity[];
  @Prop() bookingAttributes: {
    max_occupancy: number;
    bedding_setup: BeddingSetup[];
  };

  private checkAmenity(code: string) {
    return this.amenities.find(a => a.code === code);
  }
  renderAmeneties() {
    const wifi = this.checkAmenity('freewifi');
    const climatecontrol = this.checkAmenity('climatecontrol');
    const balcony = this.checkAmenity('balcony');
    return (
      <ul class="flex flex-wrap items-center  gap-2 text-xs">
        {wifi && (
          <li class="flex items-center gap-2">
            <ir-icons name="wifi" svgClassName="size-4"></ir-icons> <span>{wifi.description}</span>
          </li>
        )}
        {climatecontrol && (
          <li class="flex items-center gap-2">
            <ir-icons name="snowflake" svgClassName="size-4"></ir-icons> <span>{climatecontrol.description}</span>
          </li>
        )}
        {balcony && (
          <li class="flex items-center gap-2">
            <ir-icons name="sun" svgClassName="size-4"></ir-icons> <span>{balcony.description}</span>
          </li>
        )}
      </ul>
    );
  }
  render() {
    return (
      <div class="space-y-2 pb-2 text-xs font-normal text-gray-700">
        {this.bookingAttributes?.bedding_setup.length > 0 && (
          <div class="flex flex-wrap items-center gap-2.5">
            <ir-icons name="bed"></ir-icons>
            <div class="flex items-center">
              {this.bookingAttributes?.bedding_setup?.map((bed_setup, index) => (
                <p key={bed_setup.code}>
                  {bed_setup.name} {index < this.bookingAttributes.bedding_setup.length - 1 && <span>-&nbsp;</span>}
                </p>
              ))}
            </div>
          </div>
        )}

        {this.renderAmeneties()}
      </div>
    );
  }
}
