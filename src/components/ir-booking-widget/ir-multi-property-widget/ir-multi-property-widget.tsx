import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { IExposedProperty } from '@/models/property';
import { CombinedLevel2Properties } from '../ir-booking-widget';
import localizedWords from '@/stores/localization.store';

@Component({
  tag: 'ir-multi-property-widget',
  styleUrl: 'ir-multi-property-widget.css',
  shadow: true,
})
export class IrMultiPropertyWidget {
  @Prop({ reflect: true }) position: string;
  @Prop() linkedProperties: IExposedProperty[] = [];
  @Prop() selectedPropertyId: string | number;
  @Prop() dateModifiers: any;
  @Prop() property: IExposedProperty;
  @Prop() isFetchingProperty: boolean;
  @Prop() locale: string;
  @Prop() dates: { from_date: Date | null; to_date: Date | null };
  @Prop() guests: { adultCount: number; childrenCount: number; infants: number; childrenAges: string[] };
  @Prop() error: boolean;
  @Prop() locations: string[];
  @Prop() level2Properties: CombinedLevel2Properties;
  @Prop() selectedCity: string;

  @Event() propertyChange: EventEmitter<string | number>;
  @Event() cityChange: EventEmitter<string>;
  @Event() dateChange: EventEmitter<{ from_date: Date | null; to_date: Date | null }>;
  @Event() guestsChange: EventEmitter<{ adultCount: number; childrenCount: number; infants: number; childrenAges: string[] }>;
  @Event() bookNow: EventEmitter<void>;

  render() {
    const noPropertiesFound = this.level2Properties.properties.get(this.selectedCity).length === 0;
    return (
      <Host>
        <div class="ir-multi-property-widget__body" part="container">
          <ir-select
            class="ir-multi-property-widget__select"
            part="property-select"
            value={this.selectedCity}
            onValueChange={e => this.cityChange.emit(e.detail.toString())}
            data={this.level2Properties?.cities?.map(city => ({
              id: city,
              value: city,
            }))}
            icon
          >
            <ir-icons name={'location-dot'} slot="icon" removeClassName height={16} width={16}></ir-icons>
          </ir-select>
          {noPropertiesFound ? (
            <p class="ir-multi-property-widget__not-found">No property found</p>
          ) : (
            <ir-select
              icon
              class="ir-multi-property-widget__select"
              part="property-select"
              value={this.selectedPropertyId}
              onValueChange={e => this.propertyChange.emit(e.detail)}
              data={this.level2Properties.properties.get(this.selectedCity)?.map(property => ({
                id: property.property_id,
                value: property.property_name,
              }))}
            >
              <ir-icons name={'hotel'} slot="icon" removeClassName height={16} width={16}></ir-icons>
            </ir-select>
          )}
          <ir-widget-date-popup
            class="ir-widget__date-popup"
            dateModifiers={this.dateModifiers}
            absolute-icon
            dates={this.dates}
            locale={this.locale}
            disabled={noPropertiesFound}
            maxSpanDays={this.property?.max_nights}
            isLoading={this.isFetchingProperty}
            onDateChange={e => {
              this.dateChange.emit(e.detail);
            }}
          ></ir-widget-date-popup>
          <ir-widget-occupancy-popup
            isLoading={this.isFetchingProperty}
            disabled={noPropertiesFound}
            absolute-icon
            class="ir-widget__guests-popup"
            error={this.error}
            guests={this.guests}
            property={this.property as any}
            onGuestsChange={e => this.guestsChange.emit(e.detail)}
          ></ir-widget-occupancy-popup>
          <ir-button
            part="cta"
            disabled={this.isFetchingProperty || noPropertiesFound}
            size="md"
            label={localizedWords.entries.Lcz_BookNow}
            onButtonClick={() => this.bookNow.emit()}
          ></ir-button>
        </div>
      </Host>
    );
  }
}
