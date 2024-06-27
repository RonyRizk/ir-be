import { Component, h, State, Prop, EventEmitter, Event, Watch } from '@stencil/core';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  addDays,
  isSameDay,
  isBefore,
  isAfter,
  addYears,
  isToday,
  Locale,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { getAbbreviatedWeekdays } from '@/utils/utils';
import { IDateModifierOptions, IDateModifiers } from '../ir-date-range/ir-date-range.types';

@Component({
  tag: 'ir-calendar',
  styleUrl: 'ir-calendar.css',
  shadow: true,
})
export class IrCalendar {
  @Prop() fromDate: Date | null = null;
  @Prop() toDate: Date | null = null;
  @Prop() minDate: Date = addYears(new Date(), -24);
  @Prop() maxDate: Date = addYears(new Date(), 24);
  @Prop() dateModifiers: IDateModifiers;
  @Prop() maxSpanDays: number = 90;
  @Prop() showPrice = false;
  @Prop({ reflect: true }) locale: Locale = enUS;
  @State() selectedDate: Date = null;
  @State() displayedDays: { month: Date; days: Date[] };
  @State() hoveredDate: Date | null = null;

  @Event({ bubbles: true, composed: true }) dateChange: EventEmitter<Date>;

  @State() weekdays: string[] = [];
  componentWillLoad() {
    this.weekdays = getAbbreviatedWeekdays(this.locale);
    this.resetHours();
    const currentMonth = this.fromDate ?? new Date();
    this.displayedDays = { ...this.getMonthDays(currentMonth) };
  }
  @Watch('locale')
  handleLocale(newValue: Locale, oldLocale: Locale) {
    if (newValue !== oldLocale) {
      this.weekdays = getAbbreviatedWeekdays(newValue);
    }
  }

  getMonthDays(month: Date) {
    return {
      month,
      days: eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 1, locale: this.locale }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1, locale: this.locale }),
      }),
    };
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      this.decrementDate();
    } else if (e.key === 'ArrowRight') {
      this.incrementDate();
    } else if (e.key === 'ArrowUp') {
      this.selectedDate = addDays(new Date(this.selectedDate), -7);
    } else if (e.key === 'ArrowDown') {
      this.selectedDate = addDays(new Date(this.selectedDate), 7);
    } else if (e.key === ' ' || e.key === 'Enter') {
      this.selectDay(this.selectedDate);
    }
  };

  decrementDate() {
    if (this.selectedDate) {
      this.selectedDate = addDays(new Date(this.selectedDate), -1);
    }
  }

  incrementDate() {
    if (this.selectedDate) {
      this.selectedDate = addDays(new Date(this.selectedDate), 1);
    }
  }

  goToNextMonth(e: MouseEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const currentSecondMonth = this.displayedDays.month;
    const newSecondMonth = addMonths(currentSecondMonth, 1);
    if (isBefore(endOfMonth(newSecondMonth), this.minDate) || isAfter(startOfMonth(newSecondMonth), this.maxDate)) {
      return;
    }
    this.displayedDays = { ...this.getMonthDays(newSecondMonth) };
  }

  goToPreviousMonth(e: MouseEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const currentFirstMonth = this.displayedDays.month;
    const newFirstMonth = addMonths(currentFirstMonth, -1);
    if (isBefore(endOfMonth(newFirstMonth), this.minDate) || isAfter(startOfMonth(newFirstMonth), this.maxDate)) {
      return;
    }
    this.displayedDays = { ...this.getMonthDays(newFirstMonth) };
  }

  selectDay(day: Date) {
    this.selectedDate = day;
    this.dateChange.emit(this.selectedDate);
  }
  resetHours() {
    this.minDate.setHours(0, 0, 0, 0);
    this.maxDate.setHours(0, 0, 0, 0);
    if (this.fromDate) {
      this.toDate.setHours(0, 0, 0, 0);
    }
    if (this.toDate) {
      this.fromDate.setHours(0, 0, 0, 0);
    }
  }
  handleMouseEnter(day: Date) {
    this.hoveredDate = day;
  }

  handleMouseLeave() {
    this.hoveredDate = null;
  }

  isDaySelected(day: Date): boolean {
    const date = new Date(day);
    date.setHours(0, 0, 0, 0);
    const start = new Date(this.selectedDate ?? new Date());
    start.setHours(0, 0, 0, 0);
    return isSameDay(date, start);
  }

  checkDatePresence(day: Date) {
    if (!this.dateModifiers) {
      return;
    }
    const formatedDate = format(day, 'yyyy-MM-dd');
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
                  <span>{format(month, 'MMMM yyyy', { locale: this.locale })}</span>
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
                  {week.map((day: Date) => {
                    day.setHours(0, 0, 0, 0);
                    const checkedDate = this.checkDatePresence(day);
                    return (
                      <td class="day-cell" key={format(day, 'yyyy-MM-dd')} role="gridcell">
                        {isSameMonth(day, month) && (
                          <button
                            disabled={isBefore(day, this.minDate) || isAfter(day, this.maxDate) || checkedDate?.disabled}
                            onMouseEnter={() => this.handleMouseEnter(day)}
                            onMouseLeave={() => this.handleMouseLeave()}
                            // onKeyDown={this.handleKeyDown.bind(this)}
                            onClick={e => {
                              e.stopImmediatePropagation();
                              e.stopPropagation();
                              this.selectDay(day);
                            }}
                            aria-label={`${format(day, 'EEEE, MMMM do yyyy', { locale: this.locale })} ${
                              isBefore(day, this.minDate) || isAfter(day, this.maxDate) ? 'Not available' : ''
                            }`}
                            aria-disabled={isBefore(day, this.minDate) || isAfter(day, this.maxDate) || checkedDate?.disabled ? 'true' : 'false'}
                            aria-selected={this.isDaySelected(day)}
                            class={`day-button`}
                          >
                            <p class={`day ${isToday(day) ? 'current-date' : ''}`}>{format(day, 'd', { locale: this.locale })}</p>
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
