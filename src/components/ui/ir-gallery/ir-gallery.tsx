import { onAppDataChange } from '@/stores/app.store';
import { Component, Event, EventEmitter, Prop, Watch, h } from '@stencil/core';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

@Component({
  tag: 'ir-gallery',
  styleUrl: 'ir-gallery.css',
  shadow: true,
})
export class IrGallery {
  @Prop() images: { url: string; alt: string; thumbnail: string }[] = [];
  @Prop() totalImages: number = 0;
  @Prop() maxLength: number;
  @Prop() disableCarouselClick: boolean = false;
  @Prop() enableCarouselSwipe: boolean = false;
  @Prop() carouselStyles: Partial<CSSStyleDeclaration>;
  @Prop() carouselClasses: string;
  @Event() openGallery: EventEmitter<number>;
  private swiperInstance: Swiper;

  carouselEl: HTMLDivElement;
  nextEl: HTMLElement;
  prevEl: HTMLElement;

  componentWillLoad() {
    if (!this.maxLength) {
      this.maxLength = this.totalImages;
    }
    onAppDataChange('dir', () => {
      this.reinitializeSwiper();
    });
  }
  componentDidLoad() {
    this.initializeSwiper();
    setTimeout(() => {
      this.applyStyles();
    }, 10);
  }
  @Watch('carouselStyles')
  handleStylesChange() {
    this.applyStyles();
  }
  applyStyles() {
    if (!this.carouselStyles || !this.carouselEl) {
      return;
    }
    for (const property in this.carouselStyles) {
      if (this.carouselStyles.hasOwnProperty(property)) {
        this.carouselEl.style[property] = this.carouselStyles[property];
      }
    }
  }
  initializeSwiper() {
    if (this.swiperInstance) {
      return;
    }
    this.swiperInstance = new Swiper(this.carouselEl, {
      modules: [Navigation],
      simulateTouch: this.enableCarouselSwipe,
      allowTouchMove: this.enableCarouselSwipe,
      direction: 'horizontal',
      touchMoveStopPropagation: this.enableCarouselSwipe,
      navigation: {
        nextEl: this.nextEl,
        prevEl: this.prevEl,
      },
    });
  }
  reinitializeSwiper() {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = null;
    }
    this.initializeSwiper();
  }
  private handleOpenGallery(index = 0) {
    if (this.totalImages <= 1) {
      return;
    }
    this.openGallery.emit(index);
  }
  render() {
    return (
      <div class="gallery-container">
        {this.totalImages > 1 && (
          <button onClick={() => this.handleOpenGallery()} class="total-images-number">
            <svg xmlns="http://www.w3.org/2000/svg" height="14" width="15.75" viewBox="0 0 576 512">
              <path
                fill="currentColor"
                d="M160 80H512c8.8 0 16 7.2 16 16V320c0 8.8-7.2 16-16 16H490.8L388.1 178.9c-4.4-6.8-12-10.9-20.1-10.9s-15.7 4.1-20.1 10.9l-52.2 79.8-12.4-16.9c-4.5-6.2-11.7-9.8-19.4-9.8s-14.8 3.6-19.4 9.8L175.6 336H160c-8.8 0-16-7.2-16-16V96c0-8.8 7.2-16 16-16zM96 96V320c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H160c-35.3 0-64 28.7-64 64zM48 120c0-13.3-10.7-24-24-24S0 106.7 0 120V344c0 75.1 60.9 136 136 136H456c13.3 0 24-10.7 24-24s-10.7-24-24-24H136c-48.6 0-88-39.4-88-88V120zm208 24a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
              />
            </svg>
            <span>{this.totalImages} +</span>
          </button>
        )}
        <div class={`swiper ${this.carouselClasses ?? ''}`} ref={el => (this.carouselEl = el)}>
          <div class="swiper-wrapper">
            {this.images.map(image => (
              <div class="swiper-slide" data-swipable={this.enableCarouselSwipe}>
                {!this.disableCarouselClick && (
                  <button class="absolute">
                    <p class="sr-only">open gallery</p>
                  </button>
                )}
                <ir-image
                  thumbnail={image.thumbnail}
                  class="slide-image"
                  data-disabled={this.disableCarouselClick}
                  onClick={() => {
                    if (this.disableCarouselClick) {
                      return;
                    }
                    this.handleOpenGallery();
                  }}
                  draggable={false}
                  src={image.url}
                  alt={image.alt}
                ></ir-image>
                {/* <img
                  class="slide-image"
                  data-disabled={this.disableCarouselClick}
                  onClick={() => {
                    if (this.disableCarouselClick) {
                      return;
                    }
                    this.handleOpenGallery();
                  }}
                  importance="high"
                  draggable={false}
                  src={image.url}
                  alt={image.alt}
                /> */}
              </div>
            ))}
          </div>
          <div class="swiper-button-prev" ref={el => (this.prevEl = el)}>
            <svg xmlns="http://www.w3.org/2000/svg" height="10" width="6.25" viewBox="0 0 320 512">
              <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
            </svg>
          </div>
          <div class="swiper-button-next" ref={el => (this.nextEl = el)}>
            <svg xmlns="http://www.w3.org/2000/svg" height="10" width="6.25" viewBox="0 0 320 512">
              <path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
            </svg>
          </div>
        </div>
        <div class={'gallery'} data-images={this.images.length}>
          {this.images.slice(0, this.maxLength).map((image, idx) => (
            <figure class="gallery-item">
              <button class="absolute">
                <p class="sr-only">open gallery</p>
              </button>
              <ir-image thumbnail={image.thumbnail} class="gallery-image" onClick={() => this.handleOpenGallery(idx)} src={image.url} alt={image.alt}></ir-image>
              {/* <img  class="gallery-image" loading="lazy" onClick={() => this.handleOpenGallery(idx)} src={image.url} alt={image.alt} /> */}
            </figure>
          ))}
        </div>
      </div>
    );
  }
}
