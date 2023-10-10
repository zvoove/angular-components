import { Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';

export interface ZvDateTimeParts<TDate, TTime> {
  date: TDate | null;
  time: TTime | null;
}

@Injectable({ providedIn: 'root' })
export abstract class ZvDateAdapter<TDate> extends DateAdapter<TDate> {
  /**
   * returns an example for the user how he should provide the date
   */
  abstract parseFormatExample(): string;
}
