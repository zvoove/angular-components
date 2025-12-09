import { getLocaleFirstDayOfWeek } from '@angular/common';
import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import { ZvDateAdapter } from './date-adapter';
import { detectDmyOrder, parseHumanDateInput } from './parse-human-date-input';

const currentYear = new Date().getFullYear();

@Injectable({ providedIn: 'root' })
export class ZvNativeDateAdapter extends NativeDateAdapter implements ZvDateAdapter<Date> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  private _dmyOrder = detectDmyOrder(this.locale);

  constructor() {
    const _locale = inject(LOCALE_ID);
    super(_locale);
  }

  public override getFirstDayOfWeek(): number {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-deprecated
    return getLocaleFirstDayOfWeek(this.locale);
  }

  // If required extend other NativeDateAdapter methods.
  public override parse(value: unknown): Date | null {
    // We have no way using the native JS Date to set the parse format or locale, so we ignore these
    // parameters.
    if (typeof value === 'number') {
      return new Date(value);
    }
    if (value instanceof Date) {
      return new Date(value.getTime());
    }
    return parseHumanDateInput(currentYear, this._dmyOrder, value);
  }

  public parseFormatExample(): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const formattedDate = new Intl.DateTimeFormat(this.locale).format(new Date(2222, 11, 15));
    return formattedDate.replace('2222', 'YYYY').replace('12', 'MM').replace('15', 'DD');
  }
}
