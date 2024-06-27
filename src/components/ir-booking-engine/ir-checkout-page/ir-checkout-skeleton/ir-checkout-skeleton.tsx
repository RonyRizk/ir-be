import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-checkout-skeleton',
  styleUrl: 'ir-checkout-skeleton.css',
  shadow: true,
})
export class IrCheckoutSkeleton {
  render() {
    return (
      <Host>
        <div class="flex h-screen w-full flex-col gap-12 md:flex-row">
          <section class="flex h-full w-full flex-col gap-8">
            <div class=" flex w-full flex-col gap-4">
              <div class="block h-28 w-full animate-pulse rounded-md bg-gray-200"></div>
              <div class="flex flex-col gap-4 lg:flex-row">
                <div class="block h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
                <div class="block h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
              </div>
              <div class="flex flex-col gap-4 lg:flex-row">
                <div class="block h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
                <div class="block h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
              </div>
              <div class="flex flex-col gap-4">
                <div class="block h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
                <div class="block h-24 w-full animate-pulse rounded-md bg-gray-200"></div>
              </div>
            </div>
            <div class=" flex w-full flex-col gap-4">
              <div class="block h-14 w-full animate-pulse rounded-md bg-gray-200"></div>
              <div class="flex flex-col gap-4 lg:flex-row">
                <div class="block h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
                <div class="block h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
              </div>
              <div class="flex flex-col gap-4 lg:flex-row">
                <div class="block h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
                <div class="block h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
              </div>
              <div class="flex flex-col gap-4">
                <div class="block h-14 w-full animate-pulse rounded-md bg-gray-200"></div>
                <div class="block h-24 w-full animate-pulse rounded-md bg-gray-200"></div>
              </div>
            </div>
          </section>
          <div class="block  h-full  w-full  animate-pulse rounded-md bg-gray-200 lg:max-w-sm "></div>
        </div>
      </Host>
    );
  }
}
