import app_store from '@/stores/app.store';
import { parseISO, isValid, isAfter, isSameDay, isBefore, format } from 'date-fns';
import { z } from 'zod';

export class QueryStringValidator {
  private errors: string[] = [];

  private dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format.',
  });

  public validateCheckin(checkinStr: string): Date | null {
    this.errors = [];
    try {
      this.dateSchema.parse(checkinStr);
    } catch (e) {
      this.errors.push('Checkin date must be in YYYY-MM-DD format.');
      return null;
    }

    const checkinDate = parseISO(checkinStr);
    const today = new Date();

    if (!isValid(checkinDate)) {
      this.errors.push('Checkin date is not a valid date.');
      return null;
    }
    if (isBefore(checkinDate, today) && !isSameDay(checkinDate, today)) {
      this.errors.push('Checkin date must be today or in the future.');
      return null;
    }
    if (app_store.nonBookableNights[checkinStr]) {
      this.errors.push('Checkin date is unavailable.');
      return null;
    }
    return checkinDate;
  }

  public validateCheckout(checkoutStr: string, checkinDate: Date): Date | null {
    try {
      this.dateSchema.parse(checkoutStr);
    } catch (e) {
      this.errors.push('Checkout date must be in YYYY-MM-DD format.');
      return null;
    }

    const checkoutDate = parseISO(checkoutStr);

    if (!isValid(checkoutDate)) {
      this.errors.push('Checkout date is not a valid date.');
      return null;
    }

    if (!isAfter(checkoutDate, checkinDate)) {
      this.errors.push('Checkout date must be at least one day after checkin date.');
      return null;
    }

    if (app_store.nonBookableNights[checkoutStr] && app_store.nonBookableNights[format(checkinDate, 'yyyy-MM-dd')]) {
      this.errors.push('Checkout date is unavailable.');
      return null;
    }
    return checkoutDate;
  }

  public validateAdultCount(adultCount: string) {
    return isNaN(Number(adultCount));
  }

  public validateChildrenCount(children: string) {
    return isNaN(Number(children));
  }

  public getErrors(): string[] {
    return this.errors;
  }
}
