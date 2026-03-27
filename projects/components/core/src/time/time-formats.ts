import { InjectionToken } from '@angular/core';

export interface ZvTimeFormats {
  parse: {
    timeInput: unknown;
  };
  display: {
    timeInput: unknown;
  };
}

export const ZV_TIME_FORMATS = new InjectionToken<ZvTimeFormats>('ZV_TIME_FORMATS');
