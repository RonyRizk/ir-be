import app_store from '@/stores/app.store';
import localization_store from '@/stores/app.store';
import localizedWords from '@/stores/localization.store';
import { Component, Host, h, Element, Prop, Watch, State, Event, EventEmitter } from '@stencil/core';
import { addDays, format } from 'date-fns';
@Component({
  tag: 'ir-date-popup',
  styleUrl: 'ir-date-popup.css',
  shadow: true,
})
export class IrDatePopup {
  @Prop() dates: { start: Date | null; end: Date | null } = {
    start: null,
    end: null,
  };
  @State() isPopoverOpen = false;
  @Element() el: HTMLIrDatePopupElement;

  private popover: HTMLIrPopoverElement;
  private minDate: Date = addDays(new Date(), 0);
  @Event() dateChange: EventEmitter<{ start: Date | null; end: Date | null }>;

  @Watch('dates')
  handleDatesChange() {
    if (this.dates.end && this.isPopoverOpen) {
      this.popover.toggleVisibility();
    }
  }
  componentWillLoad() {
    this.minDate.setHours(0, 0, 0, 0);
  }
  dateTrigger() {
    return (
      <div class="popover-trigger relative w-full sm:w-fit" slot="trigger" data-state={this.isPopoverOpen ? 'opened' : 'closed'}>
        <ir-icons name="calendar" svgClassName="size-[18px]"></ir-icons>
        <div class="flex h-[3rem] flex-1 flex-col justify-center gap-0.5">
          {/* <div>
            <p class="text-xs">Check in</p>
            <p class={'date'}>
              {this.dates.start ? format(this.dates.start, 'MMM dd', { locale: localization_store.selectedLocale }) : <span class="text-slate-500">Add date</span>}
            </p>
          </div>
          <div class="flex items-end  h-full">
            <ir-icons name="minus" svgClassName="h-3 w-5 md:w-3"></ir-icons>
          </div>
          <div>
            <p class="text-xs">Check out</p>
            <p class="date">{this.dates.end ? format(this.dates.end, 'MMM dd', { locale: localization_store.selectedLocale }) : <span class="text-slate-500">Add date</span>}</p>
          </div> */}
          <p class="label">{localizedWords.entries.Lcz_Dates}</p>
          <div class="dates">
            {this.dates.start ? (
              format(this.dates.start, 'MMM dd', { locale: localization_store.selectedLocale })
            ) : (
              <span class="text-slate-500">{localizedWords.entries.Lcz_CheckIn}</span>
            )}
            <span> - </span>
            {this.dates.end ? (
              format(this.dates.end, 'MMM dd', { locale: localization_store.selectedLocale })
            ) : (
              <span class="text-slate-500">{localizedWords.entries.Lcz_CheckOut}</span>
            )}
          </div>
        </div>
      </div>
    );
  }
  render() {
    return (
      <Host>
        <ir-popover
          showCloseButton={false}
          placement="bottom-start"
          ref={el => (this.popover = el)}
          onOpenChange={e => {
            this.isPopoverOpen = e.detail;
            if (!this.isPopoverOpen && !this.dates.end && this.dates.start) {
              this.dateChange.emit({ ...this.dates, end: addDays(this.dates.start, 1) });
            }
          }}
        >
          {this.dateTrigger()}
          <div slot="popover-content" class="date-range-container w-full border-0 p-4 pb-6 shadow-none sm:w-auto sm:border sm:p-4 sm:shadow-sm md:p-6 ">
            <ir-date-range
              dateModifiers={this.getDateModifiers()}
              fromDate={this.dates.start}
              toDate={this.dates.end}
              locale={localization_store.selectedLocale}
              maxSpanDays={app_store.property.max_nights}
              minDate={this.minDate}
            ></ir-date-range>
          </div>
        </ir-popover>
      </Host>
    );
  }
  private getDateModifiers() {
    if (!Object.keys(app_store.nonBookableNights).length) {
      return undefined;
    }
    const nights = {};
    Object.keys(app_store?.nonBookableNights)?.forEach(nbn => {
      nights[nbn] = {
        disabled: true,
      };
    });
    return nights;
  }
}
