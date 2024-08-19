import { h } from '@stencil/core';

export default function InvoiceSkeleton() {
  return (
    <div class="flex flex-col gap-4 p-4">
      <div class="flex gap-2">
        <ir-skeleton class="h-8 w-32 rounded-full"></ir-skeleton>
        <ir-skeleton class="h-8 w-32 rounded-full"></ir-skeleton>
      </div>
      <div class="flex flex-col gap-2">
        <ir-skeleton class="h-4 w-48"></ir-skeleton>
        <ir-skeleton class="h-4 w-40"></ir-skeleton>
        <ir-skeleton class="h-4 w-56"></ir-skeleton>
        <ir-skeleton class="h-4 w-52"></ir-skeleton>
        <ir-skeleton class="h-4 w-44"></ir-skeleton>
      </div>
      <ir-skeleton class="h-px w-full" />
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <ir-skeleton class="h-6 w-64"></ir-skeleton>
        </div>
        <ir-skeleton class="h-4 w-40"></ir-skeleton>
      </div>
      <div class="flex flex-col gap-2">
        <ir-skeleton class="h-4 w-32"></ir-skeleton>
        <ir-skeleton class="h-4 w-48"></ir-skeleton>
        <ir-skeleton class="h-4 w-64"></ir-skeleton>
        <ir-skeleton class="h-4 w-72"></ir-skeleton>
        <ir-skeleton class="h-4 w-80"></ir-skeleton>
      </div>
      <ir-skeleton class="h-8 w-24 text-right "></ir-skeleton>
      <div class="flex flex-col gap-2">
        <ir-skeleton class="h-4 w-32"></ir-skeleton>
        <ir-skeleton class="h-4 w-48"></ir-skeleton>
        <ir-skeleton class="h-4 w-64"></ir-skeleton>
        <ir-skeleton class="h-4 w-72"></ir-skeleton>
        <ir-skeleton class="h-4 w-80"></ir-skeleton>
      </div>
      <ir-skeleton class="h-8 w-24 text-right "></ir-skeleton>
      <div class="flex items-center space-x-2">
        <ir-skeleton class="h-6 w-48"></ir-skeleton>
      </div>
      <ir-skeleton class="h-8 w-24 text-right"></ir-skeleton>
    </div>
  );
}
