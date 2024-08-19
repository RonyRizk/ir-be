import { Component, h } from '@stencil/core';

@Component({
  tag: 'ir-home-loader',
  styleUrl: 'ir-home-loader.css',
  shadow: true,
})
export class IrHomeLoader {
  render() {
    return (
      <div class="mx-auto h-full  max-w-6xl space-y-4 p-4 lg:space-y-10 lg:p-6">
        {/* Header */}
        <div class="flex items-center justify-between">
          {/* Hotel Name */}
          <ir-skeleton class={{ 'h-8 w-48': true }}></ir-skeleton>
          <ir-skeleton class="h-8 w-24"></ir-skeleton> {/* Booking Code */}
        </div>
        {/* Hotel Images */}
        <div class="grid gap-2 md:grid-cols-3">
          <ir-skeleton class="h-60 w-full md:col-span-2"></ir-skeleton> {/* Main Image */}
          <div class=" hidden h-60 gap-2 md:grid lg:grid-cols-2">
            <ir-skeleton class="h-full w-full"></ir-skeleton>
            <ir-skeleton class="h-full w-full"></ir-skeleton>
            <ir-skeleton class="hidden h-full w-full lg:block"></ir-skeleton>
            <ir-skeleton class="hidden h-full w-full lg:block"></ir-skeleton>
          </div>
        </div>
        {/* Date and Guest Selection */}
        <div class="flex space-x-2">
          <ir-skeleton class="h-28 w-full md:h-20"></ir-skeleton> {/* Check-in/Check-out */}
        </div>

        {/* Room List */}
        <div class="space-y-4">
          {[...new Array(6)].map((_, idx) => (
            <div key={idx} class="flex flex-col gap-4 md:flex-row">
              <ir-skeleton class="aspect-[16/9] h-44"></ir-skeleton>
              <div class="flex  w-full flex-1 flex-col gap-2">
                <ir-skeleton class="h-6 w-80"></ir-skeleton>
                <ir-skeleton class="h-4 w-80"></ir-skeleton>
                <ir-skeleton class="h-4 w-40"></ir-skeleton>
              </div>
            </div>
          ))}
        </div>
        <div class="space-y-4">
          <div class="flex flex-col gap-2">
            <ir-skeleton class="h-6 w-3/4"></ir-skeleton>
            <ir-skeleton class="h-4 w-full"></ir-skeleton>
            <ir-skeleton class="h-4 w-1/2"></ir-skeleton>
            <ir-skeleton class="h-4 w-3/5"></ir-skeleton>
            {[...new Array(5)].map((_, idx) => (
              <div key={idx}>
                <ir-skeleton class="h-4 w-3/5"></ir-skeleton>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
