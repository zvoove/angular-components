import { Injectable, inject } from '@angular/core';
import { ZvDateAdapter } from '../date/date-adapter';
import { ZvTimeAdapter } from '../time/time-adapter';

export interface ZvDateTimeParts<TDate, TTime> {
  date: TDate | null;
  time: TTime | null;
}

@Injectable({ providedIn: 'root' })
export abstract class ZvDateTimeAdapter<TDateTime, TDate, TTime> {
  dateAdapter = inject(ZvDateAdapter);
  timeAdapter = inject(ZvTimeAdapter);

  abstract splitDateTime(date: TDateTime | null): ZvDateTimeParts<TDate | null, TTime | null>;

  abstract mergeDateTime(date: TDate | null, time: TTime | null): TDateTime | null;
}
