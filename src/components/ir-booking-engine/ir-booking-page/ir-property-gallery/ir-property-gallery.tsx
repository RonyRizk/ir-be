import { RoomType } from '@/models/property';
import app_store from '@/stores/app.store';
import localizedWords from '@/stores/localization.store';
import { Component, Fragment, h, Listen, Prop } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-property-gallery',
  styleUrl: 'ir-property-gallery.css',
  shadow: true,
})
export class IrPropertyGallery {
  @Prop() property_state: 'carousel' | 'gallery' = 'gallery';
  @Prop() roomType: RoomType;
  private irDialog: HTMLIrDialogElement;

  @Listen('openGallery')
  handleOpenGallery() {
    if (window.innerWidth > 650) {
      this.irDialog.openModal();
    }
  }
  @Listen('carouselImageClicked')
  handleOpenCarouselGallery() {
    this.irDialog.openModal();
  }
  showPlanLimitations(withRoomSize = true) {
    if (!this.roomType) {
      return null;
    }

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

    const renderRoomSize = () =>
      withRoomSize &&
      this.roomType.size > 0 && (
        <p>
          {this.roomType.size}
          <span class="ordinal">
            m<sup>2</sup>
          </span>
        </p>
      );

    if (maxNumber > 7) {
      return (
        <div class="capacity-container pointer-events-none absolute -bottom-1 z-40 flex w-full items-center justify-between bg-white/80 px-2 py-1 pb-2 text-sm">
          <div class="flex items-center gap-2">
            <p>{localizedWords.entries.Lcz_Maximum}</p>
            {renderOccupancy()}
          </div>
          {renderRoomSize()}
        </div>
      );
    }

    return (
      <div class="capacity-container pointer-events-none absolute -bottom-0 z-40 flex w-full items-center justify-between bg-white/80 px-2 py-1 pb-2 text-sm">
        <div class="flex items-center gap-2">
          <p>{localizedWords.entries.Lcz_Maximum}</p>
          <div class="flex items-center">
            {[...Array(adult_nbr)].map((_, i) => (
              <ir-icons svgClassName="size-3" key={i} name="user"></ir-icons>
            ))}
          </div>
        </div>
        {renderRoomSize()}
      </div>
    );
  }

  render() {
    const images = this.property_state === 'carousel' ? this.roomType.images : app_store.property?.images;
    return (
      <div>
        {this.property_state === 'gallery' ? (
          <ir-gallery totalImages={app_store.property?.images.length} images={app_store.property?.images?.map(i => ({ url: i.url, alt: i.tooltip })).slice(0, 5)}></ir-gallery>
        ) : (
          <Fragment>
            <div class="flex flex-wrap items-center gap-2 py-2 text-sm font-normal text-gray-700 md:hidden">
              <ir-accomodations
                bookingAttributes={{
                  max_occupancy: this.roomType.occupancy_max.adult_nbr,
                  bedding_setup: this.roomType.bedding_setup,
                }}
                amenities={app_store.property?.amenities}
              ></ir-accomodations>
            </div>
            <div class="carousel-container relative h-48 w-full overflow-hidden rounded-md md:hidden">
              {this.roomType.images.length === 0 ? (
                <Fragment>
                  <div onClick={() => this.irDialog.openModal()} class="gallery-img icon bg-gray-300 text-white">
                    <ir-icons name="image" svgClassName="size-10 mb-4"></ir-icons>
                  </div>
                  {this.showPlanLimitations()}
                </Fragment>
              ) : this.roomType.images.length === 1 ? (
                <img onClick={() => this.irDialog.openModal()} class="gallery-img object-cover " src={this.roomType.images[0].url} alt={this.roomType.images[0].tooltip} />
              ) : (
                <ir-carousel
                  slides={this.roomType?.images?.map(img => ({
                    alt: img.tooltip,
                    id: v4(),
                    image_uri: img.url,
                  }))}
                ></ir-carousel>
              )}
              {this.showPlanLimitations()}
            </div>
            <div class="hidden  md:block">
              <div class="carousel-container relative mb-1 w-full rounded-md md:max-h-[200px] md:w-auto xl:max-h-[250px] ">
                {this.roomType.images.length === 0 ? (
                  <Fragment>
                    <div onClick={() => this.irDialog.openModal()} class="gallery-img icon hover:bg-gray-400">
                      <ir-icons name="image" svgClassName="size-10 mb-4"></ir-icons>
                    </div>
                    {this.showPlanLimitations()}
                  </Fragment>
                ) : this.roomType.images?.length === 1 ? (
                  <Fragment>
                    <img
                      onClick={() => this.irDialog.openModal()}
                      src={this.roomType.images[0].url}
                      alt={this.roomType.images[0].tooltip}
                      class="h-full w-full cursor-pointer rounded-[var(--radius,8px)] object-cover "
                    />
                    {this.showPlanLimitations()}
                  </Fragment>
                ) : (
                  <Fragment>
                    <ir-carousel
                      slides={this.roomType.images?.map(img => ({
                        alt: img.tooltip,
                        id: v4(),
                        image_uri: img.url,
                      }))}
                    ></ir-carousel>
                    {this.showPlanLimitations()}
                  </Fragment>
                )}
                {/* <div class="lg:hidden">
                  <ir-accomodations
                    bookingAttributes={{
                      max_occupancy: this.roomType.occupancy_max.adult_nbr,
                      bedding_setup: this.roomType.bedding_setup,
                    }}
                    amenities={this.exposed_property.amenities}
                  ></ir-accomodations>
                </div> */}
              </div>
              <ir-button
                onButtonClick={() => this.irDialog.openModal()}
                variants="link"
                label={localizedWords.entries.Lcz_MoreDetails}
                class="more-details-button"
                buttonStyles={{ paddingLeft: '0', paddingBottom: '0', background: 'transparent', fontSize: '12px' }}
              ></ir-button>
            </div>
          </Fragment>
        )}
        <ir-dialog ref={el => (this.irDialog = el)} closeButton={false}>
          <div slot="modal-body" class="modal-container max-h-[80vh] overflow-y-auto px-4 pb-4  pt-0 md:p-4 md:pt-0" dir="ltr">
            <div class=" sticky top-0 z-50 mb-2 flex w-full  items-center justify-between bg-white py-2 md:pt-4" dir={app_store.dir}>
              <h2 class="text-lg font-semibold md:text-xl">{this.property_state === 'carousel' ? this.roomType.name : app_store.property?.name}</h2>
              <ir-button iconName="xmark" variants="icon" onButtonClick={() => this.irDialog.closeModal()}></ir-button>
            </div>
            <section class="max-h-[80vh]">
              {images.length > 0 && (
                <div class="coursel_gallery_container hidden sm:block">
                  <ir-carousel
                    dir={app_store.dir}
                    key={this.roomType?.id + '_' + app_store.dir}
                    slides={images?.map(img => ({
                      alt: img.tooltip,
                      id: v4(),
                      image_uri: img.url,
                    }))}
                    onCarouselImageClicked={e => {
                      e.preventDefault();
                      e.stopImmediatePropagation();
                      e.stopPropagation();
                    }}
                  ></ir-carousel>
                  {this.showPlanLimitations(false)}
                </div>
              )}
              {this.property_state === 'carousel' && (
                <section class={'z-0 py-4 text-sm'} dir={app_store.dir}>
                  <ir-room-type-amenities aminities={app_store.property?.amenities} roomType={this.roomType}></ir-room-type-amenities>
                </section>
              )}
            </section>
          </div>
        </ir-dialog>
      </div>
    );
  }
}
