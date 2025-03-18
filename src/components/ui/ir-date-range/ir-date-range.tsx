import { Component, h, State, Prop, EventEmitter, Event, Watch } from '@stencil/core';
import { IDateModifiers, IDateModifierOptions } from './ir-date-range.types';
import moment, { Moment } from 'moment/min/moment-with-locales';
import { getAbbreviatedWeekdays } from '@/utils/utils';
import localizedWords from '@/stores/localization.store';
@Component({ tag: 'ir-date-range', styleUrl: 'ir-date-range.css', shadow: true })
export class IrDateRange {
  @Prop() fromDate: Moment | null = null;
  @Prop() toDate: Moment | null = null;
  @Prop() minDate: Moment = moment().add(-24, 'years');
  @Prop() maxDate: Moment = moment().add(24, 'years');
  @Prop() dateModifiers: IDateModifiers;
  @Prop() maxSpanDays: number = 90;
  @Prop() showPrice = false;
  @Prop({ reflect: true }) locale: string = 'en';
  @State() selectedDates: { start: Moment | null; end: Moment | null } = { start: moment(), end: moment() };
  @State() displayedDaysArr: { month: Moment; days: Moment[] }[] = [];
  @State() hoveredDate: Moment | null = null;

  @Event({ bubbles: true, composed: true }) dateChange: EventEmitter<{ start: Date | null; end: Date | null }>;

  @State() weekdays: string[] = [];
  componentWillLoad() {
    this.weekdays = getAbbreviatedWeekdays(this.locale);
    this.resetHours();
    this.selectedDates = { start: this.fromDate, end: this.toDate };
    const currentMonth = this.fromDate ? this.fromDate.clone() : moment();
    const nextMonth = currentMonth.clone().add(1, 'month');

    this.displayedDaysArr = [this.getMonthDays(currentMonth), this.getMonthDays(nextMonth)];
  }
  @Watch('locale')
  handleLocale(newValue: string, oldLocale: string) {
    if (newValue !== oldLocale) {
      moment.locale(newValue);
      this.weekdays = getAbbreviatedWeekdays(newValue);
    }
  }
  @Watch('fromDate')
  handleFromDateChange(newValue: Moment | null, oldValue: Moment | null) {
    if (!(newValue ?? moment()).isSame(oldValue ?? moment(), 'days')) {
      this.selectedDates = { ...this.selectedDates, start: newValue };
    }
  }
  @Watch('toDate')
  handleToDateChange(newValue: Moment | null, oldValue: Moment | null) {
    if (!(newValue ?? moment()).isSame(oldValue ?? moment(), 'days')) {
      this.selectedDates = { ...this.selectedDates, end: newValue };
    }
  }

  getMonthDays(month: Moment) {
    const startDate = moment(month).startOf('month').startOf('week');
    const endDate = moment(month).endOf('month').endOf('week');

    const days = [];
    let day = startDate.clone();

    while (day.isSameOrBefore(endDate)) {
      days.push(day.clone());
      day.add(1, 'day');
    }

    return { month, days };
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      this.decrementDate();
    } else if (e.key === 'ArrowRight') {
      this.incrementDate();
    }
  };

  decrementDate() {
    if (this.selectedDates.start && this.selectedDates.end) {
      this.selectedDates = { start: this.selectedDates.start.clone().add(-1, 'days'), end: this.selectedDates.end.clone() };
    }
  }

  incrementDate() {
    if (this.selectedDates.start && this.selectedDates.end) {
      this.selectedDates = { start: this.selectedDates.start.clone(), end: this.selectedDates.end.clone().add(1, 'days') };
    }
  }

  goToNextMonth(e: MouseEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const currentSecondMonth = this.displayedDaysArr[1].month;
    const newSecondMonth = currentSecondMonth.clone().add(1, 'months');
    if (newSecondMonth.endOf('month').isBefore(this.minDate) || newSecondMonth.startOf('month').isAfter(this.maxDate)) {
      return;
    }
    this.displayedDaysArr = [this.displayedDaysArr[1], this.getMonthDays(newSecondMonth)];
  }

  goToPreviousMonth(e: MouseEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const currentFirstMonth = this.displayedDaysArr[0].month;
    const newFirstMonth = currentFirstMonth.clone().add(-1, 'month');
    if (newFirstMonth.endOf('month').isBefore(this.minDate) || newFirstMonth.startOf('month').isAfter(this.maxDate)) {
      return;
    }
    this.displayedDaysArr = [this.getMonthDays(newFirstMonth), this.displayedDaysArr[0]];
  }

  selectDay(day: Moment) {
    let isDateDisabled = false;
    if (this.dateModifiers) {
      isDateDisabled = !!this.dateModifiers[day.format('YYYY-MM-DD')];
    }
    if (isDateDisabled && !this.selectedDates.start) {
      return;
    }

    if ((this.selectedDates.start && day.isSame(this.selectedDates.start, 'day')) || (this.selectedDates.end && day.isSame(this.selectedDates.end, 'day'))) {
      this.selectedDates = { start: day.clone(), end: null };
    } else {
      if (this.selectedDates.start === null) {
        this.selectedDates = { start: day.clone(), end: null };
      } else {
        if (this.selectedDates.end === null) {
          if (day.isBefore(this.selectedDates.start)) {
            if (isDateDisabled) {
              return;
            }
            this.selectedDates = { start: day.clone(), end: null };
          } else {
            this.selectedDates = { start: this.selectedDates.start.clone(), end: day.clone() };
          }
        } else {
          if (!isDateDisabled) {
            this.selectedDates = { start: day.clone(), end: null };
          }
        }
      }
    }

    // Convert Moment to Date for the event emission
    const startDate = this.selectedDates.start ? this.selectedDates.start.toDate() : null;
    const endDate = this.selectedDates.end ? this.selectedDates.end.toDate() : null;
    this.dateChange.emit({ start: startDate, end: endDate });
  }

  resetHours() {
    this.minDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    this.maxDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    if (this.fromDate) {
      this.fromDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    }
    if (this.toDate) {
      this.toDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    }
  }

  handleMouseEnter(day: Moment) {
    this.hoveredDate = day.clone();
  }

  handleMouseLeave() {
    this.hoveredDate = null;
  }

  isDaySelected(day: Moment): boolean {
    const date = day.clone();
    const start = this.selectedDates.start ? this.selectedDates.start.clone() : moment();
    const end = this.selectedDates.end ? this.selectedDates.end.clone() : this.hoveredDate;

    if (this.selectedDates.start && !this.selectedDates.end && this.hoveredDate && this.hoveredDate.isAfter(start, 'day')) {
      if (date.isAfter(start, 'day') && date.isBefore(end, 'day')) {
        return true;
      }
    } else if (date.isAfter(start) && this.selectedDates.end && date.isBefore(end, 'day')) {
      return true;
    }
    return false;
  }

  getMonthStyles(index: number) {
    if (index === 0) {
      if (!this.displayedDaysArr[0].month.clone().startOf('month').isAfter(this.minDate)) {
        return 'margin-horizontal';
      }
      return 'margin-right';
    } else {
      if (!this.displayedDaysArr[1].month.clone().endOf('month').isBefore(this.maxDate)) {
        return 'margin-right margin-left';
      }
      return 'margin-left';
    }
  }

  checkDatePresence(day: Moment) {
    if (!this.dateModifiers) {
      return;
    }
    const formatedDate = day.format('YYYY-MM-DD');
    const result: IDateModifierOptions = this.dateModifiers[formatedDate];
    if (result) {
      return result;
    }
    return;
  }

  render() {
    const maxSpanDays = this.selectedDates.start ? this.selectedDates.start.clone().add(this.maxSpanDays, 'days') : null;
    return (
      <div class={'date-picker'}>
        {this.displayedDaysArr.map((month, index) => (
          <table class="calendar " role="grid">
            <thead>
              <tr class="calendar-header">
                <th colSpan={7}>
                  <div class="month-navigation">
                    {index === 0 && this.displayedDaysArr[0].month.clone().startOf('month').isAfter(this.minDate) && (
                      <button name="previous month" class="navigation-buttons previous-month" type="button" onClick={this.goToPreviousMonth.bind(this)}>
                        <p class="sr-only">previous month</p>
                        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="25.6" viewBox="0 0 320 512">
                          <path
                            fill="currentColor"
                            d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
                          />
                        </svg>
                      </button>
                    )}
                    <span class={'capitalize'}>{month.month.locale(this.locale ?? 'en').format('MMMM YYYY')}</span>
                    {index === 0 && (
                      <button name="next month" class="navigation-buttons button-next" type="button" onClick={this.goToNextMonth.bind(this)}>
                        <p slot="icon" class="sr-only">
                          next month
                        </p>
                        <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="16" width="25.6" viewBox="0 0 320 512">
                          <path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
                        </svg>
                      </button>
                    )}
                    {index === 1 && this.displayedDaysArr[1].month.clone().endOf('month').isBefore(this.maxDate) && (
                      <button name="next month" class="navigation-buttons button-next-main" type="button" onClick={this.goToNextMonth.bind(this)}>
                        <p class="sr-only ">next month</p>
                        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="25.6" viewBox="0 0 320 512">
                          <path
                            fill="currentColor"
                            d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </th>
              </tr>
              <tr class="weekday-header" role="row">
                {this.weekdays.map(weekday => (
                  <th class="weekday-name" key={weekday}>
                    {weekday.replace('.', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody class="days-grid">
              {month.days
                .reduce((acc, day, index) => {
                  const weekIndex = Math.floor(index / 7);
                  if (!acc[weekIndex]) {
                    acc[weekIndex] = [];
                  }
                  acc[weekIndex].push(day);
                  return acc;
                }, [])
                .map(week => (
                  <tr class="week-row" role="row">
                    {week.map((day: Moment) => {
                      const checkedDate = this.checkDatePresence(day);
                      const isDaySelected = this.isDaySelected(day);
                      const isDaySameEnd = day.isSame(this.selectedDates.end, 'day');
                      const isDaySameStart = day.isSame(this.selectedDates.start, 'day');
                      const isDayAfterMaxDate = day.isAfter(this.maxDate, 'day');
                      const isDayBeforeMinDate = day.isBefore(this.minDate, 'day');
                      return (
                        <td class="day-cell" key={day.format('YYYY-MM-DD')} role="gridcell">
                          {day.isSame(month.month, 'month') && (
                            <button
                              disabled={isDayBeforeMinDate || isDayAfterMaxDate || (this.selectedDates.start && maxSpanDays && day.isAfter(maxSpanDays) && !this.selectedDates.end)}
                              onMouseEnter={() => this.handleMouseEnter(day)}
                              onMouseLeave={() => this.handleMouseLeave()}
                              onClick={e => {
                                e.stopImmediatePropagation();
                                e.stopPropagation();
                                this.selectDay(day);
                              }}
                              style={checkedDate?.disabled && this.selectedDates.start && { cursor: 'pointer' }}
                              title={checkedDate?.disabled ? (localizedWords?.entries?.Lcz_NoAvailability ?? 'No availability') : ''}
                              aria-unavailable={checkedDate?.disabled ? 'true' : 'false'}
                              aria-label={`${day.format('dddd, MMMM Do YYYY')} ${isDayBeforeMinDate || isDayAfterMaxDate ? localizedWords.entries.Lcz_NotAvailable : ''}`}
                              aria-disabled={isDayBeforeMinDate || isDayAfterMaxDate || checkedDate?.disabled ? 'true' : 'false'}
                              aria-selected={(this.selectedDates.start && isDaySameStart) || isDaySelected || (this.selectedDates.end && isDaySameEnd)}
                              class={{
                                'day-button': true,
                                'day-range-start': this.selectedDates.start && isDaySameStart,
                                'day-range-end': this.selectedDates.end && isDaySameEnd,
                                'highlight': isDaySelected && !isDaySameStart,
                              }}
                            >
                              <p class={`day ${day.isSame(moment(), 'day') ? 'current-date' : ''}`}>{day.locale(this.locale).format('D')}</p>
                              {this.showPrice && <p class="price">{checkedDate?.withPrice.price ? '_' : checkedDate.withPrice.price}</p>}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        ))}
      </div>
    );
  }
}
