import { LOCALE_ID } from '@angular/core';
import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { ZvDateAdapter } from './date-adapter';
import { ZvNativeDateAdapter } from './native-date-adapter';

describe('ZvNativeDateAdapter', () => {
  let adapter: ZvNativeDateAdapter;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ZvDateAdapter, useClass: ZvNativeDateAdapter }],
    }).compileComponents();
  }));

  beforeEach(inject([ZvDateAdapter], (dateAdapter: ZvNativeDateAdapter) => {
    adapter = dateAdapter;
  }));

  it('should get first day of week', () => {
    expect(adapter.getFirstDayOfWeek()).toBe(0);
  });

  it('should parse string', () => {
    expect(adapter.parse('1/1/2017')).toEqual(new Date(2017, 0, 1));
  });

  it('should parse number', () => {
    const timestamp = new Date().getTime();
    expect(adapter.parse(timestamp)).toEqual(new Date(timestamp));
  });

  it('should parse Date', () => {
    const date = new Date(2017, 0, 1);
    expect(adapter.parse(date)).toEqual(date);
    expect(adapter.parse(date)).not.toBe(date);
  });

  it('should parse invalid value as invalid', () => {
    const d = adapter.parse('hello');
    expect(d).not.toBeNull();
    expect(adapter.isDateInstance(d)).withContext('Expected string to have been fed through Date.parse').toBe(true);
    expect(adapter.isValid(d as Date))
      .withContext('Expected to parse as "invalid date" object')
      .toBe(false);
  });

  it('should return localized format example', () => {
    expect(adapter.parseFormatExample()).toEqual('MM/DD/YYYY');
  });
});

describe('ZvNativeDateAdapter with LOCALE_ID override', () => {
  let adapter: ZvNativeDateAdapter;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ZvDateAdapter, useClass: ZvNativeDateAdapter },
        { provide: LOCALE_ID, useValue: 'da-DK' },
      ],
    }).compileComponents();
  }));

  beforeEach(inject([ZvDateAdapter], (dateAdapter: ZvNativeDateAdapter) => {
    adapter = dateAdapter;
  }));

  it('should cascade locale id from the LOCALE_ID injection token to MAT_DATE_LOCALE', () => {
    const expectedValue = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    expect(adapter.getDayOfWeekNames('long')).toEqual(expectedValue);
  });

  it('should return localized format example for other LOCALE_ID', () => {
    expect(adapter.parseFormatExample()).toEqual('DD.MM.YYYY');
  });
});
