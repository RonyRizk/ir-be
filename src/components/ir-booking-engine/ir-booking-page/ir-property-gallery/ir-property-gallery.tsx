import { RoomType } from '@/models/property';
import app_store from '@/stores/app.store';
import localizedWords from '@/stores/localization.store';
import { formatImageAlt } from '@/utils/utils';
import { Component, Fragment, h, Listen, Prop, State } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-property-gallery',
  styleUrl: 'ir-property-gallery.css',
  shadow: true,
})
export class IrPropertyGallery {
  @Prop({ reflect: true }) display: 'grid' | 'default' = 'default';
  @Prop() property_state: 'carousel' | 'gallery' = 'gallery';
  @Prop() roomType: RoomType;

  @State() activeIndex = 0;

  private irDialog: HTMLIrDialogElement;

  @Listen('openGallery')
  handleOpenGallery(e: CustomEvent) {
    if (window.innerWidth > 650) {
      this.activeIndex = e.detail;
      this.irDialog.openModal();
    }
  }
  @Listen('carouselImageClicked')
  handleOpenCarouselGallery() {
    this.irDialog.openModal();
  }

  private showPlanLimitations({ withRoomSize = true, showMoreTag = false }: { withRoomSize: boolean; showMoreTag: boolean }) {
    if (!this.roomType) {
      return null;
    }

    const { adult_nbr, children_nbr } = this.roomType.occupancy_max;
    const maxNumber = adult_nbr + children_nbr;

    const renderOccupancy = () => (
      <div class="flex items-end gap-1">
        <div class="flex items-center">
          <ir-icons svgClassName="size-3" name="user"></ir-icons>
          <p>{adult_nbr}</p>
        </div>
        {children_nbr > 0 && (
          <div class="flex items-center">
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

    if (maxNumber > 4) {
      return (
        <div class="capacity-container pointer-events-none absolute -bottom-0 z-10 flex w-full items-center justify-between bg-white/80 px-2 py-2 text-sm">
          <div class="flex items-center gap-2">
            <p>{localizedWords.entries.Lcz_Maximum}</p>
            {renderOccupancy()}
          </div>
          {renderRoomSize()}
          {showMoreTag && (
            <div class="flex items-center gap-1.5">
              <span>{localizedWords.entries.Lcz_MoreDetails}</span>
              <span>
                <ir-icons name="arrow-up-right-from-square" svgClassName="size-3"></ir-icons>
              </span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div class="capacity-container pointer-events-none absolute -bottom-0 z-10 flex w-full items-center justify-between bg-white/80 px-2 py-2 text-sm">
        <div class="flex items-center gap-2">
          <p>{localizedWords.entries.Lcz_Maximum}</p>
          <div class="flex items-center">
            {[...Array(adult_nbr)].map((_, i) => (
              <ir-icons svgClassName="size-3" key={i} name="user"></ir-icons>
            ))}
            {[...Array(children_nbr)].map((_, i) => (
              <ir-icons key={i} svgClassName="size-3" name="child"></ir-icons>
            ))}
          </div>
        </div>
        {renderRoomSize()}
        {showMoreTag && (
          <div class="flex items-center gap-1.5">
            <span>{localizedWords.entries.Lcz_MoreDetails}</span>
            <span>
              <ir-icons name="arrow-up-right-from-square" svgClassName="size-3"></ir-icons>
            </span>
          </div>
        )}
      </div>
    );
  }
  private renderRoomtypeImages() {
    return (
      <Fragment>
        <div class={`carousel-container relative  overflow-hidden  ${this.display === 'default' ? 'md:hidden' : ''}`}>
          {this.roomType.images.length === 0 ? (
            <Fragment>
              <div onClick={() => this.irDialog.openModal()} class="gallery-img icon  bg-gray-300 text-white">
                <ir-icons name="image" svgClassName="size-10 mb-4"></ir-icons>
              </div>
              {this.showPlanLimitations({ showMoreTag: true, withRoomSize: true })}
            </Fragment>
          ) : this.roomType.images.length === 1 ? (
            <img
              onClick={() => this.irDialog.openModal()}
              class="gallery-img object-cover "
              src={this.roomType.images[0].url}
              alt={formatImageAlt(this.roomType.images[0].tooltip, this.roomType?.name)}
            />
          ) : (
            <ir-carousel
              carouselClasses="pg_carousel"
              onCarouselImageIndexChange={e => (this.activeIndex = e.detail)}
              slides={this.roomType?.images?.map(img => ({
                alt: formatImageAlt(img.tooltip, this.roomType?.name),
                id: v4(),
                image_uri: img.url,
                thumbnail: img.thumbnail,
              }))}
            ></ir-carousel>
          )}
          {this.showPlanLimitations({ showMoreTag: true, withRoomSize: true })}
        </div>
        {this.display === 'default' && (
          <div class="hidden  md:block">
            <div class="carousel-container relative mb-1 w-full rounded-md  md:w-auto  ">
              {this.roomType.images.length === 0 ? (
                <Fragment>
                  <div onClick={() => this.irDialog.openModal()} class="gallery-img icon hover:bg-gray-400">
                    <ir-icons name="image" svgClassName="size-10 mb-4"></ir-icons>
                  </div>
                  {this.showPlanLimitations({ showMoreTag: true, withRoomSize: true })}
                </Fragment>
              ) : this.roomType.images?.length === 1 ? (
                <Fragment>
                  <div onClick={() => this.irDialog.openModal()} class="gallery-img icon hover:bg-gray-400">
                    {/* <ir-icons name="image" svgClassName="size-10 mb-4"></ir-icons> */}
                    <img
                      // onClick={() => this.irDialog.openModal()}
                      src={this.roomType.images[0].url}
                      alt={formatImageAlt(this.roomType.images[0].tooltip, this.roomType?.name)}
                      class="single-image h-full w-full cursor-pointer
                   object-cover "
                    />
                  </div>
                  {this.showPlanLimitations({ showMoreTag: true, withRoomSize: true })}
                </Fragment>
              ) : (
                <Fragment>
                  <ir-carousel
                    onCarouselImageIndexChange={e => (this.activeIndex = e.detail)}
                    slides={this.roomType.images?.map(img => ({
                      alt: formatImageAlt(img.tooltip, this.roomType?.name),
                      id: v4(),
                      image_uri: img.url,
                      thumbnail: img.thumbnail,
                    }))}
                  ></ir-carousel>
                  {this.showPlanLimitations({ showMoreTag: true, withRoomSize: true })}
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
            {/* <ir-button
        onButtonClick={() => this.irDialog.openModal()}
        variants="link"
        label={localizedWords.entries.Lcz_MoreDetails}
        class="more-details-button"
        buttonStyles={{ paddingLeft: '0', paddingBottom: '0', background: 'transparent', fontSize: '12px' }}
      ></ir-button> */}
          </div>
        )}
      </Fragment>
    );
  }

  render() {
    const images = this.property_state === 'carousel' ? this.roomType.images?.slice(0, 16) : app_store.property?.images?.slice(0, 24);
    return (
      <div>
        {this.property_state === 'gallery' ? (
          <ir-gallery
            totalImages={images?.length}
            images={images?.map(i => ({ url: i.url, alt: formatImageAlt(i.tooltip), thumbnail: i?.thumbnail }))}
            maxLength={5}
            disableCarouselClick={true}
            enableCarouselSwipe={true}
          ></ir-gallery>
        ) : (
          this.renderRoomtypeImages()
        )}
        <ir-dialog ref={el => (this.irDialog = el)} closeButton={false}>
          <div
            slot="modal-body"
            class={
              this.property_state !== 'carousel'
                ? 'modal-container relative max-h-[80vh] overflow-y-auto px-4 pb-4  pt-0 md:p-4'
                : 'modal-container max-h-[90vh] overflow-y-auto px-4 pb-4  pt-0 md:p-4 md:pt-0'
            }
            dir="ltr"
          >
            <div
              style={{ width: this.property_state !== 'carousel' ? '720px' : '100%' }}
              class={
                this.property_state !== 'carousel'
                  ? 'absolute left-8  top-8 z-50 flex w-72 items-center justify-between text-white '
                  : 'sticky top-0 z-50 mb-2 flex w-full  items-center justify-between bg-white py-2 md:pt-4'
              }
              dir={app_store.dir}
            >
              <h2 class="text-lg font-semibold md:text-xl">{this.property_state === 'carousel' ? this.roomType.name : app_store.property?.name}</h2>
              <ir-button
                buttonStyles={{ background: 'var(--gray-200, #eaecf0)', padding: '5px' }}
                iconName="xmark"
                variants="icon"
                onButtonClick={() => this.irDialog.closeModal()}
              ></ir-button>
            </div>
            <section class="max-h-[80vh]">
              {images.length > 0 && (
                <div class="carousel_gallery_container hidden sm:block">
                  <ir-carousel
                    enableCarouselSwipe
                    activeIndex={this.activeIndex}
                    dir={app_store.dir}
                    key={this.roomType?.id + '_' + app_store.dir}
                    slides={images?.map(img => ({
                      alt: formatImageAlt(img.tooltip, this.roomType?.name),
                      id: v4(),
                      image_uri: img.url,
                      thumbnail: img.thumbnail,
                    }))}
                    onCarouselImageClicked={e => {
                      e.preventDefault();
                      e.stopImmediatePropagation();
                      e.stopPropagation();
                    }}
                  ></ir-carousel>
                  {/* {this.showPlanLimitations({ showMoreTag: false, withRoomSize: false })} */}
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
