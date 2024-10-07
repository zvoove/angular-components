import { Injectable } from '@angular/core';
import { Time } from '../time/time';
import { ZvDateTimeAdapter, ZvDateTimeParts } from './date-time-adapter';

@Injectable({ providedIn: 'root' })
export class ZvNativeDateTimeAdapter extends ZvDateTimeAdapter<Date, Date, Time> {
  override splitDateTime(date: Date | null): ZvDateTimeParts<Date | null, Time | null> {
    if (!date) {
      return {
        date: null,
        time: null,
      };
    }
    return {
      date: this.dateAdapter.createDate(date.getFullYear(), date.getMonth(), date.getDate()),
      time: this.timeAdapter.createTime(date.getHours(), date.getMinutes()),
    };
  }

  override mergeDateTime(date: Date | null, time: Time | null): Date | null {
    if (date === null) {
      return null;
    }
    if (!this.dateAdapter.isValid(date) || (time != null && !this.timeAdapter.isValid(time))) {
      return this.dateAdapter.invalid();
    }
    const newValue = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (time != null) {
      newValue.setHours(time.hours);
      newValue.setMinutes(time.minutes);
    }
    return newValue;
  }
}
