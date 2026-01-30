import { Component, h, Element, Prop, Fragment, State, Host, Watch } from '@stencil/core';
import localization_store from '@/stores/app.store';
import { CommonService } from '@/services/api/common.service';
import { PropertiesByLevel2Response, PropertyService } from '@/services/api/property.service';
import axios from 'axios';
import app_store from '@/stores/app.store';
import moment from 'moment/min/moment-with-locales';
import Token from '@/models/Token';
import { IExposedProperty } from '@/models/property';
import localizedWords from '@/stores/localization.store';

export type CombinedLevel2Properties = {
  cities: string[];
  properties: Map<string, PropertiesByLevel2Response[]>;
};

@Component({
  tag: 'ir-widget',
  styleUrl: 'ir-booking-widget.css',
  shadow: true,
})
export class IrBookingWidget {
  @Element() el: HTMLIrWidgetElement;

  @Prop() pool: string;

  //Level2 city names separated by
  @Prop() l: string;

  @Prop({ reflect: true }) position: 'fixed' | 'block' = 'fixed';
  @Prop() propertyId: number = 42;
  @Prop() perma_link: string = null;
  @Prop() p: string = null;
  @Prop() language: string = 'en';
  @Prop() roomTypeId: string | null = null;
  @Prop() aff: string = null;
  @Prop() delay: number = 300;

  @State() isPopoverOpen: boolean;
  @State() property: IExposedProperty;
  @State() dateModifiers: any;
  @State() isLoading: boolean;
  @State() isGuestPopoverOpen: boolean;
  @State() dates: { from_date: Date | null; to_date: Date | null } = {
    from_date: null,
    to_date: null,
  };

  @State() level2Properties: CombinedLevel2Properties;
  @State() selectedCity: string;

  @State() guests: { adultCount: number; childrenCount: number; infants: number; childrenAges: string[] };
  @State() linkedProperties: IExposedProperty[] = [];
  @State() selectedProperty: IExposedProperty;
  @State() isFetchingProperty: boolean = true;

  private baseUrl: string = 'https://gateway.igloorooms.com/IRBE';

  private token = new Token();

  private commonService = new CommonService();
  private propertyService = new PropertyService();
  private guestPopover: HTMLIrPopoverElement;
  private containerRef: HTMLDivElement;
  private elTimout: NodeJS.Timeout;
  private error: boolean;
  private baseGuests = {
    adultCount: 2,
    childrenCount: 0,
    infants: 0,
    childrenAges: [],
  };
  private mainWidgetPopupRef: HTMLIrPopupElement;

  componentWillLoad() {
    this.initApp();
    this.guests = this.baseGuests;
    app_store.userPreferences = {
      language_id: this.language,
      currency_id: 'usd',
    };
    this.initProperty();
  }

  componentDidLoad() {
    console.log('the widget is loaded');
    if (this.position === 'fixed') {
      console.log('widget appended to body');
      document.body.appendChild(this.el);
    }
  }

  @Watch('selectedCity')
  handleCityChange(newValue: string) {
    const firstCityPropertyRow = this.level2Properties.properties?.get(newValue)![0];
    if (firstCityPropertyRow) {
      this.selectedProperty = {
        id: firstCityPropertyRow.property_id,
      } as any;
    } else {
      this.selectedProperty = null;
    }
  }

  @Watch('selectedProperty')
  async handlePropertyChange(newValue, oldValue) {
    if (!this.isMultiPropertyMode()) {
      return;
    }
    if (newValue?.id === oldValue?.id || !newValue) {
      return;
    }
    this.isFetchingProperty = true;
    const [property] = await Promise.all([
      this.propertyService.getExposedProperty({
        id: newValue.id,
        language: this.language,
        aname: null,
        perma_link: null,
      }),
      this.propertyService.getExposedNonBookableNights({
        porperty_id: newValue.id,
        from_date: moment().format('YYYY-MM-DD'),
        to_date: moment().add(1, 'years').format('YYYY-MM-DD'),
        perma_link: null,
        aname: null,
      }),
    ]);
    this.property = property;
    this.selectedProperty = property;
    this.dateModifiers = { ...this.getDateModifiers() };

    if (this.property?.adult_child_constraints?.child_max_age === 0 && this.guests.childrenCount > 0) {
      this.guests = { ...this.baseGuests, adultCount: this.guests.adultCount };
    }

    if (this.hasDisabledDateInRange(this.dates?.from_date, this.dates?.to_date, this.dateModifiers)) {
      this.dates = {
        from_date: null,
        to_date: null,
      };
    }
    this.isFetchingProperty = false;
    if (this.isLoading) {
      this.showWidget();
    }
  }
  private hasDisabledDateInRange(from: Date | null, to: Date | null, dateModifiers?: Record<string, { disabled: boolean }>): boolean {
    if (!from || !to || !dateModifiers) return false;

    const cursor = moment(from);
    const end = moment(to);

    while (cursor.isSameOrBefore(end, 'day')) {
      const key = cursor.format('YYYY-MM-DD');
      if (dateModifiers[key]?.disabled) {
        return true;
      }
      cursor.add(1, 'day');
    }

    return false;
  }
  private get isMultiProperties() {
    return this.linkedProperties?.length > 1;
  }
  private get isLevel2Mode() {
    const city_perma_links = this.parseCommaSeparated(this.l);
    return city_perma_links?.length > 0 && !!this.pool && !this.isMultiProperties;
  }

  private get isSingleProperty() {
    const properties = this.parseCommaSeparated(this.p);
    return properties.length === 1 && (this.p || this.propertyId);
  }

  private initApp() {
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = this.baseUrl;
    this.resetPageFontSize();
  }

  private resetPageFontSize() {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = 'html { font-size: 16px; }';
    document.head.appendChild(styleEl);
  }

  private parseCommaSeparated(value?: string | null): string[] {
    return (
      value
        ?.split(',')
        .map(v => v.trim())
        .filter(Boolean) ?? []
    );
  }

  private async initProperty() {
    try {
      this.isLoading = true;
      const token = await this.commonService.getBEToken();
      this.token.setToken(token);

      const properties = this.parseCommaSeparated(this.p);
      const city_perma_links = this.parseCommaSeparated(this.l);

      const isSingleProperty = this.isSingleProperty;
      const isMultiProperty = properties.length > 1;

      const [property, linkedProperties, level2SeparationsProperties] = await Promise.all([
        // Single property only (NOT level-2)
        isSingleProperty
          ? this.propertyService.getExposedProperty({
              id: this.propertyId,
              language: this.language,
              aname: properties[0],
              perma_link: this.perma_link,
            })
          : Promise.resolve(null),

        // Multi-property ONLY
        isMultiProperty
          ? this.propertyService.getExposedProperties({
              anames: properties,
              language: this.language,
            })
          : Promise.resolve(null),

        // Level-2 ONLY when single property
        city_perma_links?.length > 0 && !!this.pool && !isMultiProperty
          ? this.propertyService.fetchPropertiesByLevel2({
              pool: this.pool,
              city_perma_links,
            })
          : Promise.resolve(null),

        this.commonService.getExposedLanguage(),

        // Non-bookable nights ONLY when not level-2
        isSingleProperty
          ? this.propertyService.getExposedNonBookableNights({
              porperty_id: this.propertyId,
              from_date: moment().format('YYYY-MM-DD'),
              to_date: moment().add(1, 'years').format('YYYY-MM-DD'),
              perma_link: this.perma_link,
              aname: properties[0],
            })
          : Promise.resolve(null),
      ]);
      if (city_perma_links?.length > 0 && !!this.pool && !isMultiProperty) {
        this.setLevel2Properties(level2SeparationsProperties);
      } else {
        this.linkedProperties = linkedProperties ?? [];
        this.selectedProperty = this.linkedProperties.length > 0 ? this.linkedProperties[0] : property;
      }
      if (property) {
        this.property = property;
      }
      // this.property = property;
      this.dateModifiers = this.getDateModifiers();
    } catch (error) {
      console.log(error);
    } finally {
      if (this.isSingleProperty) {
        this.showWidget();
      }
    }
  }

  private showWidget() {
    this.isLoading = false;
    this.elTimout = setTimeout(() => {
      if (!this.containerRef) {
        return;
      }
      this.containerRef.style.opacity = '1';
    }, this.delay);
  }

  private setLevel2Properties(level2SeparationsProperties: PropertiesByLevel2Response[] | null) {
    if (!level2SeparationsProperties || level2SeparationsProperties.length === 0) {
      this.level2Properties = { cities: [], properties: new Map() };
      return;
    }

    const citiesMap = new Map<string, string>();
    const propertiesMap = new Map<string, PropertiesByLevel2Response[]>();

    for (const row of level2SeparationsProperties) {
      if (!citiesMap.has(row.city_perma_link)) {
        // citiesMap.set(row.city_id, {
        //   id: row.city_id,
        //   name: row.city_perma_link,
        // });
        citiesMap.set(row.city_perma_link, row.city_perma_link);
      }

      const existing = propertiesMap.get(row.city_perma_link);
      if (existing) {
        existing.push(row);
      } else {
        propertiesMap.set(row.city_perma_link, [row]);
      }
    }

    const cities = this.parseCommaSeparated(this.l);

    for (const city of cities) {
      if (!propertiesMap.has(city)) {
        propertiesMap.set(city, []);
      }
    }

    this.level2Properties = {
      cities,
      properties: propertiesMap,
    };

    const firstCity = cities.find(city => propertiesMap.get(city)?.length > 0);

    if (firstCity) {
      this.selectedCity = firstCity;
    }
  }

  private isMultiPropertyMode(): boolean {
    return this.isLevel2Mode || this.isMultiProperties;
  }

  private handleBooknow() {
    if (!this.validateChildrenAges()) return;
    let subdomainURL = `bookingmystay.com`;
    const currentDomain = `${this.selectedProperty.perma_link}.${subdomainURL}`;
    const { from_date, to_date } = this.dates;
    const { adultCount, childrenCount } = this.guests;
    const fromDate = from_date ? `checkin=${moment(from_date).format('YYYY-MM-DD')}` : '';
    const toDate = to_date ? `checkout=${moment(to_date).format('YYYY-MM-DD')}` : '';
    const adults = adultCount > 0 ? `adults=${adultCount}` : '';
    const children = childrenCount > 0 ? `children=${childrenCount}` : '';
    const roomTypeId = this.roomTypeId ? `u=${this.roomTypeId}` : '';
    const affiliate = this.aff ? `aff=${this.aff}` : '';
    const ages = this.guests.childrenCount > 0 && this.guests.childrenAges.length > 0 ? `ages=${this.guests.childrenAges.join('_')}` : '';
    const queryParams = [fromDate, toDate, adults, children, roomTypeId, affiliate, ages];
    const queryString = queryParams.filter(param => param !== '').join('&');
    window.open(`https://${currentDomain}?${queryString}`, '_blank');
  }

  private getDateModifiers() {
    if (!Object.keys(app_store?.nonBookableNights ?? {})?.length) {
      return undefined;
    }
    const nights = {};
    Object.keys(app_store?.nonBookableNights)?.forEach(nbn => {
      nights[nbn] = {
        disabled: true,
      };
    });
    return nights;
  }

  private validateChildrenAges() {
    if (this.guests.childrenAges.some(c => c === '')) {
      this.error = true;
      return false;
    }
    this.guestPopover?.forceClose();
    return true;
  }

  private renderMultiWidget() {
    return (
      <ir-multi-property-widget
        isFetchingProperty={this.isFetchingProperty}
        selectedCity={this.selectedCity}
        level2Properties={this.level2Properties}
        linkedProperties={this.linkedProperties}
        selectedPropertyId={this.selectedProperty?.id}
        dateModifiers={this.dateModifiers}
        property={this.selectedProperty as any}
        locale={localization_store.selectedLocale}
        dates={this.dates}
        guests={this.guests}
        error={this.error}
        position={this.position}
        exportparts="container, property-select, cta"
        onCityChange={e => {
          this.selectedCity = e.detail;
        }}
        onPropertyChange={e => {
          const propertyId = Number(e.detail);
          this.selectedProperty = { id: propertyId } as any;
        }}
        onDateChange={e => {
          this.dates = e.detail;
        }}
        onGuestsChange={e => (this.guests = { ...e.detail })}
        onBookNow={() => this.handleBooknow()}
      ></ir-multi-property-widget>
    );
  }

  disconnectedCallback() {
    if (this.elTimout) {
      clearTimeout(this.elTimout);
    }
  }

  render() {
    if (this.isLoading) {
      return null;
    }

    if (this.isLevel2Mode) {
      if (this.position === 'block') {
        return this.renderMultiWidget();
      }
      return (
        <ir-popup sync="width" ref={el => (this.mainWidgetPopupRef = el)} distance={-45} class="ir-multi-property-widget__popup">
          <ir-button slot="anchor" part="anchor" size="md" class="ir-multi-property-widget__anchor" label={localizedWords.entries.Lcz_BookNow}></ir-button>
          <header class="ir-multi-property-widget__header" part="header">
            <h5>{localizedWords.entries.Lcz_BookNow}</h5>
            <ir-button
              onButtonClick={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.mainWidgetPopupRef.close();
              }}
              iconName="xmark"
              variants="icon"
            ></ir-button>
          </header>
          {this.renderMultiWidget()}
        </ir-popup>
      );
    }
    return (
      <Host data-multi={this.isMultiProperties ? 'true' : 'false'}>
        <div part="container" class="ir-widget" data-multi={this.isMultiProperties ? 'true' : 'false'} ref={el => (this.containerRef = el)}>
          <div part="hover" class={'ir-widget__hover'}></div>
          {this.isMultiProperties && (
            <select
              part="property-select"
              class="ir-widget__property-select"
              onChange={e => {
                const propertyId = (e.target as HTMLSelectElement).value;
                this.selectedProperty = this.linkedProperties.find(p => p.id.toString() === propertyId);
              }}
            >
              {this.linkedProperties.map(property => (
                <option selected={this.selectedProperty.id.toString() === property.id.toString()} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          )}
          <Fragment>
            <ir-widget-date-popup
              class="ir-widget__date-popup"
              dateModifiers={this.dateModifiers}
              exportparts="date-trigger"
              dates={this.dates}
              locale={localization_store.selectedLocale}
              maxSpanDays={this.property?.max_nights}
              onDateChange={e => {
                this.dates = e.detail;
              }}
            ></ir-widget-date-popup>
            <ir-widget-occupancy-popup
              exportparts="guests-trigger"
              class="ir-widget__guests-popup"
              error={this.error}
              guests={this.guests}
              property={this.property as any}
              onGuestsChange={e => (this.guests = { ...e.detail })}
            ></ir-widget-occupancy-popup>
          </Fragment>
          <button part="cta" class="ir-widget__cta" onClick={this.handleBooknow.bind(this)}>
            {this.isMultiProperties ? (
              <svg xmlns="http://www.w3.org/2000/svg" height={24} width={24} viewBox="0 0 640 640">
                <path
                  fill="currentColor"
                  d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"
                />
              </svg>
            ) : (
              localizedWords.entries.Lcz_BookNow
            )}
          </button>
        </div>
      </Host>
    );
  }
}
