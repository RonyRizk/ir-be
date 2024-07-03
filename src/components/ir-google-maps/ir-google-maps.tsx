import app_store from '@/stores/app.store';
import { Component, Element, Host, h } from '@stencil/core';
import { Loader } from 'google-maps';
@Component({
  tag: 'ir-google-maps',
  styleUrl: 'ir-google-maps.css',
  shadow: true,
})
export class IrGoogleMaps {
  @Element() el: HTMLIrGoogleMapsElement;
  map: google.maps.Map<HTMLElement>;

  async componentDidLoad() {
    if (this.map) {
      return;
    }

    const loader = new Loader('AIzaSyCJ5P4SraJdZzcBi9Ue16hyg_iWJv-aHpk', {});
    const google = await loader.load();
    this.map = new google.maps.Map(this.el.shadowRoot.getElementById('map'), {
      center: { lat: app_store.property?.location.latitude || 34.022, lng: app_store.property?.location.longitude || 35.628 },
      zoom: 15,
    });
    new google.maps.Marker({
      position: this.map.getCenter(),
      map: this.map,
      title: app_store.property?.name,
    });
  }
  render() {
    return (
      <Host>
        <div id="map" class="h-full w-full"></div>
      </Host>
    );
  }
}
