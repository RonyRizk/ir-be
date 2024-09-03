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
import { IDateModifiers, IDateModifierOptions } from './ir-date-range.types';
import { enUS } from 'date-fns/locale';
import { getAbbreviatedWeekdays } from '@/utils/utils';
import localizedWords from '@/stores/localization.store';

@Component({
  tag: 'ir-date-range',
  styleUrl: 'ir-date-range.css',
  shadow: true,
})
export class IrDateRange {
  @Prop() fromDate: Date | null = null;
  @Prop() toDate: Date | null = null;
  @Prop() minDate: Date = addYears(new Date(), -24);
  @Prop() maxDate: Date = addYears(new Date(), 24);
  @Prop() dateModifiers: IDateModifiers;
  @Prop() maxSpanDays: number = 90;
  @Prop() showPrice = false;
  @Prop({ reflect: true }) locale: Locale = enUS;
  @State() selectedDates: { start: Date | null; end: Date | null } = { start: new Date(), end: new Date() };
  @State() displayedDaysArr: { month: Date; days: Date[] }[] = [];
  @State() hoveredDate: Date | null = null;

  @Event({ bubbles: true, composed: true }) dateChange: EventEmitter<{ start: Date | null; end: Date | null }>;

  @State() weekdays: string[] = [];
  componentWillLoad() {
    this.weekdays = getAbbreviatedWeekdays(this.locale);
    this.resetHours();
    this.selectedDates = {
      start: this.fromDate,
      end: this.toDate,
    };
    const currentMonth = this.fromDate ?? new Date();
    const nextMonth = addMonths(currentMonth, 1);

    this.displayedDaysArr = [this.getMonthDays(currentMonth), this.getMonthDays(nextMonth)];
  }
  @Watch('locale')
  handleLocale(newValue: Locale, oldLocale: Locale) {
    if (newValue !== oldLocale) {
      this.weekdays = getAbbreviatedWeekdays(newValue);
    }
  }
  @Watch('fromDate')
  handleFromDateChange(newValue: Date, oldValue: Date) {
    if (!isSameDay(newValue || new Date(), oldValue || new Date())) {
      this.selectedDates = {
        ...this.selectedDates,
        start: newValue,
      };
    }
  }
  @Watch('toDate')
  handleToDateChange(newValue: Date, oldValue: Date) {
    if (!isSameDay(newValue || new Date(), oldValue || new Date())) {
      this.selectedDates = {
        ...this.selectedDates,
        end: newValue,
      };
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
    }
  };

  decrementDate() {
    if (this.selectedDates.start && this.selectedDates.end) {
      this.selectedDates = {
        start: addDays(new Date(this.selectedDates.start), -1),
        end: new Date(this.selectedDates.end),
      };
    }
  }

  incrementDate() {
    if (this.selectedDates.start && this.selectedDates.end) {
      this.selectedDates = {
        start: new Date(this.selectedDates.start),
        end: addDays(new Date(this.selectedDates.end), 1),
      };
    }
  }

  goToNextMonth(e: MouseEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const currentSecondMonth = this.displayedDaysArr[1].month;
    const newSecondMonth = addMonths(currentSecondMonth, 1);
    if (isBefore(endOfMonth(newSecondMonth), this.minDate) || isAfter(startOfMonth(newSecondMonth), this.maxDate)) {
      return;
    }
    this.displayedDaysArr = [this.displayedDaysArr[1], this.getMonthDays(newSecondMonth)];
  }

  goToPreviousMonth(e: MouseEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const currentFirstMonth = this.displayedDaysArr[0].month;
    const newFirstMonth = addMonths(currentFirstMonth, -1);
    if (isBefore(endOfMonth(newFirstMonth), this.minDate) || isAfter(startOfMonth(newFirstMonth), this.maxDate)) {
      return;
    }
    this.displayedDaysArr = [this.getMonthDays(newFirstMonth), this.displayedDaysArr[0]];
  }

  selectDay(day: Date) {
    if (isSameDay(new Date(this.selectedDates.start), new Date(day)) || isSameDay(new Date(this.selectedDates.end), new Date(day))) {
      this.selectedDates = { start: day, end: null };
    } else {
      if (this.selectedDates.start === null) {
        this.selectedDates = { start: day, end: null };
      } else {
        if (this.selectedDates.end === null) {
          if (isBefore(day, this.selectedDates.start)) {
            this.selectedDates = { start: day, end: null };
          } else {
            this.selectedDates = { ...this.selectedDates, end: day };
          }
        } else {
          this.selectedDates = { start: day, end: null };
        }
      }
    }
    this.dateChange.emit(this.selectedDates);
  }
  resetHours() {
    this.minDate.setHours(0, 0, 0, 0);
    this.maxDate.setHours(0, 0, 0, 0);
    if (this.fromDate) {
      this.fromDate.setHours(0, 0, 0, 0);
    }
    if (this.toDate) {
      console.log(this.toDate);
      this.toDate.setHours(0, 0, 0, 0);
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
    const start = new Date(this.selectedDates.start ?? new Date());
    start.setHours(0, 0, 0, 0);
    const end = this.selectedDates.end ? new Date(this.selectedDates.end) : this.hoveredDate;
    end?.setHours(0, 0, 0, 0);

    if (this.selectedDates.start && !this.selectedDates.end && this.hoveredDate && isAfter(this.hoveredDate, start)) {
      if (isAfter(date, start) && isBefore(date, end)) {
        return true;
      }
    } else if (isAfter(date, start) && this.selectedDates.end && isBefore(date, end)) {
      return true;
    }
    return false;
  }

  getMonthStyles(index: number) {
    if (index === 0) {
      if (!isAfter(startOfMonth(this.displayedDaysArr[0].month), this.minDate)) {
        return 'margin-horizontal';
      }
      return 'margin-right';
    } else {
      if (!isBefore(endOfMonth(this.displayedDaysArr[1].month), this.maxDate)) {
        return 'margin-right margin-left';
      }
      return 'margin-left';
    }
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
    return (
      <div class={'date-picker'}>
        {this.displayedDaysArr.map((month, index) => (
          <table class="calendar " role="grid">
            <thead>
              <tr class="calendar-header">
                <th colSpan={7}>
                  <div class="month-navigation">
                    {index === 0 && isAfter(startOfMonth(this.displayedDaysArr[0].month), this.minDate) && (
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
                    <span>{format(month.month, 'MMMM yyyy', { locale: this.locale })}</span>
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
                    {index === 1 && isBefore(endOfMonth(this.displayedDaysArr[1].month), this.maxDate) && (
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
                    {weekday}
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
                    {week.map((day: Date) => {
                      day.setHours(0, 0, 0, 0);
                      const checkedDate = this.checkDatePresence(day);
                      return (
                        <td class="day-cell" key={format(day, 'yyyy-MM-dd')} role="gridcell">
                          {isSameMonth(day, month.month) && (
                            <button
                              disabled={isBefore(day, this.minDate) || isAfter(day, this.maxDate) || checkedDate?.disabled}
                              onMouseEnter={() => this.handleMouseEnter(day)}
                              onMouseLeave={() => this.handleMouseLeave()}
                              onClick={e => {
                                e.stopImmediatePropagation();
                                e.stopPropagation();
                                this.selectDay(day);
                              }}
                              aria-label={`${format(day, 'EEEE, MMMM do yyyy', { locale: this.locale })} ${
                                isBefore(day, this.minDate) || isAfter(day, this.maxDate) ? localizedWords.entries.Lcz_NotAvailable : ''
                              }`}
                              aria-disabled={isBefore(day, this.minDate) || isAfter(day, this.maxDate) || checkedDate?.disabled ? 'true' : 'false'}
                              aria-selected={
                                (this.selectedDates.start && isSameDay(new Date(this.selectedDates.start), new Date(day))) ||
                                this.isDaySelected(day) ||
                                (this.selectedDates.end && isSameDay(new Date(this.selectedDates.end ?? new Date()), new Date(day)))
                              }
                              class={`day-button  ${this.selectedDates.start && isSameDay(new Date(this.selectedDates.start), new Date(day)) ? 'day-range-start' : ''}
                          ${this.selectedDates.end && isSameDay(new Date(this.selectedDates.end ?? new Date()), new Date(day)) ? 'day-range-end' : ''}  
                            ${this.isDaySelected(day) ? 'highlight' : ''}
                            `}
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
        ))}
      </div>
    );
  }
}
