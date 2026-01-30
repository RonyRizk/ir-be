import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import moment from 'moment/min/moment-with-locales';

@Component({
  tag: 'ir-widget-date-popup',
  styleUrl: 'ir-widget-date-popup.scss',
  shadow: true,
})
export class IrWidgetDatePopup {
  @Prop() dateModifiers: any;
  @Prop() dates: { from_date: Date | null; to_date: Date | null };
  @Prop() locale: string;
  @Prop() disabled: boolean;
  @Prop() maxSpanDays: number;
  @Prop({ attribute: 'absolute-icon' }) absoluteIcon: boolean = false;
  @Prop() isLoading: boolean;

  @Event() dateChange: EventEmitter<{ from_date: Date | null; to_date: Date | null }>;

  private dateWidgetPopupRef: HTMLIrPopupElement;
  private mobileDatePopupModal: HTMLIrPopupElement;
  private mediaQueryList: MediaQueryList;
  private handleMediaChange: (e: MediaQueryListEvent) => void;

  componentDidLoad() {
    this.mediaQueryList = window.matchMedia('(min-width: 640px)');

    this.handleMediaChange = e => {
      if (e.matches) {
        // We crossed into >= 640px
        this.mobileDatePopupModal?.close();
      }
    };

    // Run once in case we load already at >= 640px
    if (this.mediaQueryList.matches) {
      this.mobileDatePopupModal?.close();
    }

    this.mediaQueryList.addEventListener('change', this.handleMediaChange);
  }

  disconnectedCallback() {
    this.mediaQueryList?.removeEventListener('change', this.handleMediaChange);
  }

  private renderDateTrigger(slot = 'trigger') {
    const from = this.dates?.from_date;
    const to = this.dates?.to_date;
    let fromLabel = '';
    let toLabel = '';

    if (from) {
      fromLabel = moment(from).format('DD MMM YYYY');
    }
    if (to) {
      toLabel = moment(to).format('DD MMM YYYY');
    }

    return (
      <button disabled={this.disabled} class={`ir-widget__date-trigger relative ${this.absoluteIcon ? '--absolute-icon' : ''}`} part="date-trigger" slot={slot}>
        <div class={this.absoluteIcon ? 'pointer-events-none absolute inset-y-0 start-2 flex  items-center' : ''}>
          <ir-icons name="calendar" svgClassName="ir-widget__icon" removeClassName height={16} width={16}></ir-icons>
        </div>
        {fromLabel && toLabel ? (
          <div>
            <p>
              <span>{fromLabel}</span>
              <span> - </span>
              <span>{toLabel}</span>
            </p>
          </div>
        ) : (
          <div>
            <p>Your dates</p>
          </div>
        )}
      </button>
    );
  }

  private renderLoadingTrigger(slot = 'trigger') {
    return (
      <div class={`ir-widget__date-trigger ir-widget__trigger--loading relative ${this.absoluteIcon ? '--absolute-icon' : ''}`} part="date-trigger" slot={slot} aria-busy="true">
        <div class={this.absoluteIcon ? 'pointer-events-none absolute inset-y-0 start-2 flex  items-center' : ''}>
          <span class="ir-widget__loading-icon ir-widget__shimmer"></span>
        </div>
        <div class="ir-widget__loading-range">
          <span class="ir-widget__loading-line --short ir-widget__shimmer"></span>
          <span class="ir-widget__loading-line --medium ir-widget__shimmer"></span>
        </div>
      </div>
    );
  }

  private renderDateRange() {
    return (
      <ir-date-range
        dateModifiers={this.dateModifiers}
        minDate={moment()}
        style={{ '--radius': 'var(--ir-widget-radius)' }}
        fromDate={this.dates?.from_date ? moment(this.dates.from_date) : null}
        toDate={this.dates?.to_date ? moment(this.dates.to_date) : null}
        locale={this.locale}
        maxSpanDays={this.maxSpanDays}
        onDateChange={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          const { end, start } = e.detail;
          if (end && start) {
            this.dateWidgetPopupRef.close();
            this.mobileDatePopupModal?.close();
          }
          this.dateChange.emit({
            from_date: start,
            to_date: end,
          });
        }}
      ></ir-date-range>
    );
  }

  render() {
    return (
      <Host>
        <ir-popup modal withArrow class="ir-multi-property-date-popup__popup" ref={el => (this.mobileDatePopupModal = el)}>
          {this.isLoading ? this.renderLoadingTrigger('anchor') : this.renderDateTrigger('anchor')}
          {!this.isLoading && (
            <header class={'ir-multi-property-date-popup__header'}>
              <ir-button
                onButtonClick={e => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  this.mobileDatePopupModal.close();
                }}
                iconName="xmark"
                variants="icon"
              ></ir-button>
            </header>
          )}
          {!this.isLoading && this.renderDateRange()}
        </ir-popup>
        <ir-popup withArrow class="ir-multi-property-date-popup__popup" ref={el => (this.dateWidgetPopupRef = el)}>
          {this.isLoading ? this.renderLoadingTrigger('anchor') : this.renderDateTrigger('anchor')}
          {!this.isLoading && this.renderDateRange()}
        </ir-popup>
      </Host>
    );
  }
}
