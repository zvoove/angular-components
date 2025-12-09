import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { Time } from '../time/time';
import { parseHumanTimeInput } from './parse-human-time-input';
import { ZvTimeAdapter } from './time-adapter';

@Injectable({ providedIn: 'root' })
export class ZvNativeTimeAdapter extends ZvTimeAdapter<Time> {
  public readonly locale = inject(LOCALE_ID);

  private _is24HourFormat: boolean | null = null;
  public is24HourFormat(): boolean {
    if (this._is24HourFormat === null) {
      const hourCycle = new Intl.DateTimeFormat(this.locale, { hour: 'numeric' }).resolvedOptions().hourCycle ?? '';
      this._is24HourFormat = ['h23', 'h24'].includes(hourCycle);
    }
    return this._is24HourFormat;
  }

  override createTime(hour: number, minute: number): Time {
    // use ngDevMode, when it is exposed: https://github.com/angular/angular-cli/issues/23738
    if (hour < 0 || hour > 23) {
      throw Error(`Invalid hour "${hour}". Hour has to be between 0 and 23.`);
    }

    if (minute < 0 || minute > 59) {
      throw Error(`Invalid minute "${minute}". Minute has to be between 0 and 59.`);
    }

    return {
      hours: hour,
      minutes: minute,
    };
  }

  override parse(value: unknown): Time | null {
    if (this.isTimeInstance(value)) {
      return this.createTime(value.hours, value.minutes);
    }
    const time = parseHumanTimeInput(value);
    if (time == null) {
      return null;
    }
    if (Array.isArray(time)) {
      return this.createTime(time[0], time[1]);
    }
    return this.invalid();
  }

  override format(time: Time, displayFormat: unknown = null): string {
    if (!time) {
      return '';
    }
    if (isNaN(time.hours) || isNaN(time.minutes)) {
      throw new Error('ZvNativeTimeAdapter: Cannot format invalid Time.');
    }
    displayFormat ??= {};
    if (typeof displayFormat !== 'object') {
      throw new Error('ZvNativeTimeAdapter: displayFormat must be of type Intl.DateTimeFormatOptions.');
    }
    return new Intl.DateTimeFormat(this.locale, {
      hour12: !this.is24HourFormat(),
      hour: '2-digit',
      minute: '2-digit',
      ...displayFormat,
    }).format(new Date(2000, 1, 1, time.hours, time.minutes));
  }

  override isTimeInstance(obj: unknown): obj is Time {
    return obj !== null && typeof obj == 'object' && 'hours' in obj && 'minutes' in obj;
  }

  override isValid(time: Time): boolean {
    return !isNaN(time.minutes) && !isNaN(time.hours);
  }

  override invalid(): Time {
    return {
      hours: NaN,
      minutes: NaN,
    };
  }

  override compareTime(first: Time, second: Time): number {
    return first.hours - second.hours || first.minutes - second.minutes;
  }

  public parseFormatExample(): string {
    const formattedDate = new Intl.DateTimeFormat(this.locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(0, 0, 0, 11, 30));
    return formattedDate.replace('11', 'hh').replace('30', 'mm');
  }
}
