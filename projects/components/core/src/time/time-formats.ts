import { InjectionToken } from '@angular/core';

export declare type ZvTimeFormats = {
  parse: {
    timeInput: any;
  };
  display: {
    timeInput: any;
  };
};

export const ZV_TIME_FORMATS = new InjectionToken<ZvTimeFormats>('ZV_TIME_FORMATS');
