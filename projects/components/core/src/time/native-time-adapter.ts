import { Time } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { ZvTimeAdapter } from './time-adapter';
import { parseHumanTimeInput } from './parse-human-time-input';

@Injectable({ providedIn: 'root' })
export class ZvNativeTimeAdapter extends ZvTimeAdapter<Time> {
  constructor(@Inject(LOCALE_ID) public locale: string) {
    super();
  }

  private _is24HourFormat: boolean | null = null;
  public is24HourFormat(): boolean {
    if (this._is24HourFormat === null) {
      this._is24HourFormat = new Date(79200000).toLocaleTimeString(this.locale).indexOf('11') === -1;
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

  override parse(value: unknown, _parseFormat: any = null): Time {
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

  override format(time: Time, displayFormat: any = null): string {
    if (!time) {
      return '';
    }
    if (isNaN(time.hours) || isNaN(time.minutes)) {
      throw new Error('ZvNativeTimeAdapter: Cannot format invalid Time.');
    }
    return new Intl.DateTimeFormat(this.locale, {
      hour12: !this.is24HourFormat(),
      hour: '2-digit',
      minute: '2-digit',
      ...displayFormat,
    }).format(new Date(2000, 1, 1, time.hours, time.minutes));
  }

  override isTimeInstance(obj: any): obj is Time {
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
