import { Platform } from '@angular/cdk/platform';
import { getLocaleFirstDayOfWeek } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import { detectDmyOrder, parseHumanDateInput } from './parse-human-date-input';
import { ZvDateAdapter } from './date-adapter';

const currentYear = new Date().getFullYear();

@Injectable({ providedIn: 'root' })
export class ZvNativeDateAdapter extends NativeDateAdapter implements ZvDateAdapter<Date> {
  private _dmyOrder = detectDmyOrder(this.locale);

  constructor(@Inject(LOCALE_ID) _locale: string, platform: Platform) {
    super(_locale, platform);
  }

  public override getFirstDayOfWeek(): number {
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
    const formattedDate = new Intl.DateTimeFormat(this.locale).format(new Date(2222, 11, 15));
    return formattedDate.replace('2222', 'YYYY').replace('12', 'MM').replace('15', 'DD');
  }
}
