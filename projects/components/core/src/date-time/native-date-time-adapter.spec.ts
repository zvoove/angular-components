import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { ZvNativeDateAdapter } from '../date/native-date-adapter';
import { ZV_NATIVE_DATE_FORMATS } from '../date/native-date-formats';
import { provideDateTimeFormats, provideDateTimeAdapters } from '../date-time-providers';
import { ZvNativeTimeAdapter } from '../time/native-time-adapter';
import { ZV_NATIVE_TIME_FORMATS } from '../time/native-time-formats';
import { ZvDateTimeAdapter } from './date-time-adapter';
import { ZvNativeDateTimeAdapter } from './native-date-time-adapter';

describe('ZvNativeDateTimeAdapter', () => {
  let adapter: ZvNativeDateTimeAdapter;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        provideDateTimeFormats(ZV_NATIVE_DATE_FORMATS, ZV_NATIVE_TIME_FORMATS),
        provideDateTimeAdapters(ZvNativeDateTimeAdapter, ZvNativeDateAdapter, ZvNativeTimeAdapter),
      ],
    }).compileComponents();
  }));

  beforeEach(inject([ZvDateTimeAdapter], (dateAdapter: ZvNativeDateTimeAdapter) => {
    adapter = dateAdapter;
  }));

  it('should merge date and time while ignoring dates time values', () => {
    expect(adapter.mergeDateTime(new Date(2017, 0, 3, 6, 6, 6), { hours: 11, minutes: 30 })).toEqual(new Date(2017, 0, 3, 11, 30, 0));
    expect(adapter.mergeDateTime(null, { hours: 11, minutes: 30 })).toEqual(null);
    expect(isValidDate(adapter.mergeDateTime(adapter.dateAdapter.invalid(), { hours: 11, minutes: 30 }))).toEqual(false);
    expect(isValidDate(adapter.mergeDateTime(new Date(2017, 0, 3, 6, 6, 6), adapter.timeAdapter.invalid()))).toEqual(false);
  });

  it('should split out date and time', () => {
    expect(adapter.splitDateTime(new Date(2017, 0, 3, 11, 30, 0))).toEqual({
      date: new Date(2017, 0, 3),
      time: { hours: 11, minutes: 30 },
    });
    expect(adapter.splitDateTime(null)).toEqual({
      date: null,
      time: null,
    });
  });

  it('should have correct date and time adapters', () => {
    expect(adapter.dateAdapter).toBeInstanceOf(ZvNativeDateAdapter);
    expect(adapter.timeAdapter).toBeInstanceOf(ZvNativeTimeAdapter);
  });
});

function isValidDate(date: unknown) {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  return false;
}
