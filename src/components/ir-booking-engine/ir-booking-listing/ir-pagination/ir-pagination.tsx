import localizedWords from '@/stores/localization.store';
import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-pagination',
  styleUrl: 'ir-pagination.css',
  shadow: true,
})
export class IrPagination {
  @Prop() total: number;
  @Prop() current: number;
  @Prop() minPageShown: number = 7;

  @Event() pageChange: EventEmitter<number>;
  private getPages(): Array<number | string> {
    const wingSize = 2;
    let pages = [];

    for (let i = 1; i <= this.total; i++) {
      if (this.total <= this.minPageShown) {
        pages.push(i);
      } else {
        if (i === 1) {
          pages.push(i);
        } else if (i === this.total) {
          pages.push(i);
        } else if (i >= this.current - wingSize && i <= this.current + wingSize) {
          pages.push(i);
        } else if ((i === 2 && this.current > wingSize + 1) || (i === this.total - 1 && this.current < this.total - wingSize)) {
          pages.push('...');
        }
      }
    }

    return pages;
  }
  render() {
    if (this.total <= 1) {
      return;
    }
    const pages = this.getPages();

    return (
      <Host>
        <ir-button
          disabled={this.current === 1}
          onButtonClick={() => this.pageChange.emit(this.current - 1)}
          variants="outline"
          label={localizedWords.entries.Lcz_Previous}
          haveLeftIcon
        >
          <ir-icons class="ir-icons" name={localizedWords.direction === 'rtl' ? 'arrow_left' : 'arrow_left'} slot="left-icon" svgClassName="size-3"></ir-icons>
        </ir-button>
        {/* <p class="current-page-info">{localizedWords.entries.Lcz_PageOf.replace('%1', this.current.toString()).replace('%2', this.total.toString())}</p> */}
        <ul>
          {pages.map(page =>
            typeof page === 'number' ? (
              <li class={this.current === page ? 'active' : ''}>
                <button onClick={() => this.pageChange.emit(page)} type="button">
                  {page}
                </button>
              </li>
            ) : (
              <li class="ellipsis">{page}</li>
            ),
          )}
        </ul>
        <ir-button
          disabled={this.current === this.total}
          onButtonClick={() => this.pageChange.emit(this.current + 1)}
          variants="outline"
          label={localizedWords.entries.Lcz_Next}
          haveRightIcon
        >
          <ir-icons class="ir-icons" name={'arrow_right'} slot="right-icon" svgClassName="size-3"></ir-icons>
        </ir-button>
      </Host>
    );
  }
}
