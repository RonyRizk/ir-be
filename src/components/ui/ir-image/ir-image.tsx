import { Component, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'ir-image',
  styleUrl: 'ir-image.css',
  shadow: true,
})
export class IrImage {
  @Prop() src: string;
  @Prop() thumbnail: string;
  @Prop() blurhash: string;
  @Prop() width: number = 32;
  @Prop() height: number = 32;
  @Prop() alt: string;

  @State() blurDataUrl: string;
  @State() loaded: boolean = false;

  private imageRef: HTMLImageElement;

  async componentWillLoad() {
    this.decodeBlurHash();

    // Pre-check if the image is cached before the initial render:
    if (this.src) {
      const img = new Image();
      img.src = this.src;
      if (img.complete && img.naturalWidth !== 0) {
        // If the image is cached, set loaded = true before first render
        this.loaded = true;
      }
    }
  }

  decodeBlurHash() {
    // ... same as before ...
  }

  handleImageLoad() {
    this.loaded = true;
  }

  checkImageCached() {
    if (this.imageRef && this.imageRef.complete && this.imageRef.naturalHeight !== 0) {
      this.loaded = true;
    }
  }

  render() {
    return (
      <div class="image-container">
        {this.blurDataUrl && !this.thumbnail && <img src={this.blurDataUrl} class={`placeholder ${this.loaded ? 'hidden' : ''}`} alt="placeholder" />}
        {this.thumbnail !== undefined && <img src={`data:image/png;base64,${this.thumbnail}`} class={`placeholder ${this.loaded ? 'hidden' : ''}`} alt="placeholder" />}
        <img
          ref={el => {
            this.imageRef = el as HTMLImageElement;
            // Removed checkImageCached() from here
          }}
          src={this.src}
          class={`original  visible`}
          // class={`original ${this.loaded ? 'visible' : ''}`}
          alt={this.alt}
          // loading="lazy"
          onLoad={() => this.handleImageLoad()}
        />
      </div>
    );
  }
}
