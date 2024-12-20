import { Component, Event, EventEmitter, Prop, Watch, h } from '@stencil/core';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { TCarouselSlides } from './carousel';
import { onAppDataChange } from '@/stores/app.store';
@Component({
  tag: 'ir-carousel',
  styleUrl: 'ir-carousel.css',
  scoped: true,
})
export class IrCarousel {
  @Prop() slides: TCarouselSlides[] = [];
  @Prop() activeIndex: number = 0;
  @Prop() enableCarouselSwipe: boolean = false;
  @Prop() styles: Partial<CSSStyleDeclaration>;
  @Prop() carouselClasses: string;

  @Event() carouselImageClicked: EventEmitter<null>;
  @Event() carouselImageIndexChange: EventEmitter<number>;

  private swiperInstance: Swiper;

  private carouselEl: HTMLDivElement;
  private prevEl: HTMLDivElement;
  private nextEl: HTMLDivElement;

  componentWillLoad() {
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
  @Watch('styles')
  handleStylesChange() {
    this.applyStyles();
  }
  applyStyles() {
    if (!this.styles || !this.carouselEl) {
      return;
    }
    for (const property in this.styles) {
      if (this.styles.hasOwnProperty(property)) {
        this.carouselEl.style[property] = this.styles[property];
      }
    }
  }

  reinitializeSwiper() {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = null;
    }
    this.initializeSwiper();
  }
  initializeSwiper() {
    if (this.swiperInstance) {
      return;
    }
    this.swiperInstance = new Swiper(this.carouselEl, {
      modules: [Navigation, Pagination],
      simulateTouch: this.enableCarouselSwipe,
      allowTouchMove: this.enableCarouselSwipe,
      direction: 'horizontal',
      touchMoveStopPropagation: this.enableCarouselSwipe,
      navigation: {
        nextEl: this.nextEl,
        prevEl: this.prevEl,
      },
    });
    this.swiperInstance.on('slideChange', s => {
      this.carouselImageIndexChange.emit(s.activeIndex);
    });
    this.swiperInstance.slideTo(this.activeIndex);
  }
  @Watch('activeIndex')
  handleActiveIndexChange(newValue: number, oldValue: number) {
    if (newValue !== oldValue) {
      this.swiperInstance.slideTo(newValue);
    }
  }

  render() {
    return (
      <div class={`swiper ${this.carouselClasses ?? ''}`} ref={el => (this.carouselEl = el)}>
        <div class="swiper-wrapper">
          {/* Slides */}
          {this.slides.map(slide => (
            <div class="swiper-slide" data-swipable={this.enableCarouselSwipe}>
              <ir-image thumbnail={slide.thumbnail} class="slide-img" src={slide.image_uri} onClick={() => this.carouselImageClicked.emit(null)} key={slide.id} alt={slide.alt} />
              {/* <img loading="lazy" src={slide.image_uri} onClick={() => this.carouselImageClicked.emit(null)} key={slide.id} alt={slide.alt} /> */}
            </div>
          ))}
        </div>

        <div class="swiper-pagination"></div>

        <div class="swiper-button-prev lg:size-7" ref={el => (this.prevEl = el)}>
          <svg xmlns="http://www.w3.org/2000/svg" height="10" width="6.25" viewBox="0 0 320 512">
            <path
              fill="currentColor"
              d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
            />
          </svg>
        </div>
        <div class="swiper-button-next lg:size-7" ref={el => (this.nextEl = el)}>
          <svg xmlns="http://www.w3.org/2000/svg" height="10" width="6.25" viewBox="0 0 320 512">
            <path
              fill="currentColor"
              d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"
            />
          </svg>
        </div>
      </div>
    );
  }
}
