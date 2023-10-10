import { Provider, Type } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { ZvDateTimeAdapter } from './date-time/date-time-adapter';
import { ZvDateAdapter } from './date/date-adapter';
import { ZvTimeAdapter } from './time/time-adapter';
import { ZV_TIME_FORMATS, ZvTimeFormats } from './time/time-formats';

export function provideDateTimeAdapters<TDateTime, TDate, TTime>(
  dateTimeAdapter: Type<ZvDateTimeAdapter<TDateTime, TDate, TTime>>,
  dateAdapter: Type<ZvDateAdapter<TDate>>,
  timeAdapter: Type<ZvTimeAdapter<TTime>>
): Provider[] {
  return [
    { provide: ZvDateTimeAdapter, useClass: dateTimeAdapter },
    { provide: ZvDateAdapter, useClass: dateAdapter },
    { provide: DateAdapter, useExisting: ZvDateAdapter },
    { provide: ZvTimeAdapter, useClass: timeAdapter },
  ];
}

export function provideDateTimeFormats(dateFormats: MatDateFormats, timeFormats: ZvTimeFormats): Provider[] {
  return [
    { provide: ZV_TIME_FORMATS, useValue: timeFormats },
    { provide: MAT_DATE_FORMATS, useValue: dateFormats },
  ];
}
