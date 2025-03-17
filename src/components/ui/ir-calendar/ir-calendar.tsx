import { Component, h, State, Prop, EventEmitter, Event, Watch } from '@stencil/core';
import moment, { Moment } from 'moment/min/moment-with-locales';
import { getAbbreviatedWeekdays } from '@/utils/utils';
import { IDateModifierOptions, IDateModifiers } from '../ir-date-range/ir-date-range.types';
import localizedWords from '@/stores/localization.store';

@Component({
  tag: 'ir-calendar',
  styleUrl: 'ir-calendar.css',
  shadow: true,
})
export class IrCalendar {
  @Prop({ mutable: true }) fromDate: Moment | null = null;
  @Prop({ mutable: true }) toDate: Moment | null = null;
  @Prop({ mutable: true }) minDate: Moment = moment().add(-24, 'years');
  @Prop({ mutable: true }) maxDate: Moment = moment().add(24, 'years');
  @Prop() dateModifiers: IDateModifiers;
  @Prop() maxSpanDays: number = 90;
  @Prop() showPrice = false;
  @Prop({ reflect: true }) locale: string = 'en';
  @Prop() date: Moment = moment();
  @State() selectedDate: Moment = null;
  @State() displayedDays: { month: Moment; days: Moment[] };
  @State() hoveredDate: Moment | null = null;

  @Event({ bubbles: true, composed: true }) dateChange: EventEmitter<Moment>;

  @State() weekdays: string[] = [];

  componentWillLoad() {
    this.weekdays = getAbbreviatedWeekdays(this.locale);
    this.resetHours();
    const currentMonth = this.fromDate ?? moment();
    this.displayedDays = { ...this.getMonthDays(currentMonth) };
    this.selectedDate = this.date;
    moment.locale(this.locale);
  }

  @Watch('date')
  handleDateChange(newDate: Moment, oldDate: Moment) {
    if (!newDate.isSame(oldDate, 'day')) {
      this.selectedDate = newDate;
    }
  }

  @Watch('locale')
  handleLocale(newValue: string, oldLocale: string) {
    if (newValue !== oldLocale) {
      moment.locale(this.locale);
      this.weekdays = getAbbreviatedWeekdays(newValue);
    }
  }

  getMonthDays(month: Moment) {
    const startDate = month.clone().startOf('month').startOf('week').add(1, 'day');
    const endDate = month.clone().endOf('month').endOf('week').add(1, 'day');

    const days = [];
    let day = startDate.clone();

    while (day.isBefore(endDate)) {
      days.push(day.clone());
      day = day.clone().add(1, 'day');
    }

    return {
      month,
      days,
    };
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      this.decrementDate();
    } else if (e.key === 'ArrowRight') {
      this.incrementDate();
    } else if (e.key === 'ArrowUp') {
      this.selectedDate = this.selectedDate.clone().add(-7, 'days');
    } else if (e.key === 'ArrowDown') {
      this.selectedDate = this.selectedDate.clone().add(7, 'days');
    } else if (e.key === ' ' || e.key === 'Enter') {
      this.selectDay(this.selectedDate);
    }
  };

  decrementDate() {
    if (this.selectedDate) {
      this.selectedDate = this.selectedDate.clone().add(-1, 'days');
    }
  }

  incrementDate() {
    if (this.selectedDate) {
      this.selectedDate = this.selectedDate.clone().add(1, 'days');
    }
  }

  goToNextMonth(e: MouseEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const currentMonth = this.displayedDays.month;
    const newMonth = currentMonth.clone().add(1, 'month');

    if (newMonth.endOf('month').isBefore(this.minDate) || newMonth.startOf('month').isAfter(this.maxDate)) {
      return;
    }

    this.displayedDays = { ...this.getMonthDays(newMonth) };
  }

  goToPreviousMonth(e: MouseEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const currentMonth = this.displayedDays.month;
    const newMonth = currentMonth.clone().add(-1, 'month');

    if (newMonth.endOf('month').isBefore(this.minDate) || newMonth.startOf('month').isAfter(this.maxDate)) {
      return;
    }

    this.displayedDays = { ...this.getMonthDays(newMonth) };
  }

  selectDay(day: Moment) {
    this.selectedDate = day;
    this.dateChange.emit(this.selectedDate);
  }

  resetHours() {
    this.minDate = this.minDate.clone().startOf('day');
    this.maxDate = this.maxDate.clone().startOf('day');

    if (this.fromDate) {
      this.fromDate = this.fromDate.clone().startOf('day');
    }
    if (this.toDate) {
      this.toDate = this.toDate.clone().startOf('day');
    }
  }

  handleMouseEnter(day: Moment) {
    this.hoveredDate = day;
  }

  handleMouseLeave() {
    this.hoveredDate = null;
  }

  isDaySelected(day: Moment): boolean {
    return day.isSame(this.selectedDate, 'day');
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
    const { month, days } = this.displayedDays;

    return (
      <div class={'date-picker'}>
        <table class="calendar " role="grid">
          <thead>
            <tr class="calendar-header">
              <th colSpan={7}>
                <div class="month-navigation">
                  <button name="previous month" class="navigation-buttons" type="button" onClick={this.goToPreviousMonth.bind(this)}>
                    <p class="sr-only">previous month</p>
                    <svg xmlns="http://www.w3.org/2000/svg" height="16" width="25.6" viewBox="0 0 320 512">
                      <path
                        fill="currentColor"
                        d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
                      />
                    </svg>
                  </button>
                  <span>{month.locale(this.locale).format('MMMM YYYY')}</span>
                  <button name="next month" class="navigation-buttons" type="button" onClick={this.goToNextMonth.bind(this)}>
                    <p class="sr-only ">next month</p>
                    <svg xmlns="http://www.w3.org/2000/svg" height="16" width="25.6" viewBox="0 0 320 512">
                      <path
                        fill="currentColor"
                        d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"
                      />
                    </svg>
                  </button>
                </div>
              </th>
            </tr>
            <tr class="weekday-header" role="row">
              {this.weekdays.map(weekday => (
                <th class="weekday-name" key={weekday}>
                  {weekday}
                </th>
              ))}
            </tr>
          </thead>
          <tbody class="days-grid">
            {days
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
                    return (
                      <td class="day-cell" key={day.format('YYYY-MM-DD')} role="gridcell">
                        {day.isSame(month, 'month') && (
                          <button
                            disabled={day.isBefore(this.minDate) || day.isAfter(this.maxDate) || checkedDate?.disabled}
                            onMouseEnter={() => this.handleMouseEnter(day)}
                            onMouseLeave={() => this.handleMouseLeave()}
                            onClick={e => {
                              e.stopImmediatePropagation();
                              e.stopPropagation();
                              this.selectDay(day);
                            }}
                            aria-label={`${day.locale(this.locale).format('dddd, MMMM Do YYYY')} ${
                              day.isBefore(this.minDate) || day.isAfter(this.maxDate) ? localizedWords.entries.Lcz_NotAvailable : ''
                            }`}
                            aria-disabled={day.isBefore(this.minDate) || day.isAfter(this.maxDate) || checkedDate?.disabled ? 'true' : 'false'}
                            aria-selected={this.isDaySelected(day)}
                            class={`day-button`}
                          >
                            <p class={`day ${day.isSame(moment(), 'day') ? 'current-date' : ''}`}>{day.format('D')}</p>
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
      </div>
    );
  }
}
