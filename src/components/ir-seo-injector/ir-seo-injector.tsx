import { Component, Prop, Watch, Element } from '@stencil/core';

@Component({
  tag: 'ir-seo-injector',
  shadow: false,
})
export class IrSeoInjector {
  @Element() el: HTMLElement;

  @Prop() pageTitle: string;
  @Prop() pageDescription: string;
  @Prop() pageKeywords: string;

  @Watch('pageTitle')
  @Watch('pageDescription')
  @Watch('pageKeywords')
  updateMetaTags() {
    if (this.pageTitle) {
      document.title = this.pageTitle;
    }
    this.updateMeta('description', this.pageDescription);
    this.updateMeta('keywords', this.pageKeywords);
  }

  // Method to update or create a meta tag
  updateMeta(name: string, content: string) {
    let element = document.querySelector(`meta[name="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  }

  // Lifecycle method to update meta tags when component loads
  componentWillLoad() {
    this.updateMetaTags();
  }

  render() {
    // This component does not render anything visible
    return null;
  }
}
