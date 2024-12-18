import { LOCALE_ID } from '@angular/core';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { Time } from '../time/time';
import { ZvNativeTimeAdapter } from './native-time-adapter';
import { ZvTimeAdapter } from './time-adapter';

function newTime(h: number, m: number) {
  return { hours: h, minutes: m };
}

describe('ZvNativeTimeAdapter', () => {
  let adapter: ZvNativeTimeAdapter;
  let assertValidTime: (d: Time | null, valid: boolean) => void;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ZvTimeAdapter, useClass: ZvNativeTimeAdapter },
        { provide: LOCALE_ID, useValue: 'de-DE' },
      ],
    }).compileComponents();
  }));

  beforeEach(inject([ZvTimeAdapter], (timeAdapter: ZvNativeTimeAdapter) => {
    adapter = timeAdapter;

    assertValidTime = (t: Time | null, valid: boolean) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-base-to-string
      expect(adapter.isTimeInstance(t)).not.withContext(`Expected ${t} to be a time instance`).toBeNull();
      expect(adapter.isValid(t!))
        .withContext(`Expected ${JSON.stringify(t)} to be ${valid ? 'valid' : 'invalid'}, but ` + `was ${valid ? 'invalid' : 'valid'}`)
        .toBe(valid);
    };
  }));

  it('should create Time', () => {
    expect(adapter.createTime(22, 33)).toEqual(newTime(22, 33));
  });

  it('should not create Time with month over/under-flow', () => {
    expect(() => adapter.createTime(-1, 11)).toThrow();
    expect(() => adapter.createTime(24, 11)).toThrow();
  });

  it('should not create Time with Time over/under-flow', () => {
    expect(() => adapter.createTime(11, -1)).toThrow();
    expect(() => adapter.createTime(11, 60)).toThrow();
  });

  it('should be able to tell if two times are the same', () => {
    expect(adapter.sameTime(adapter.invalid(), adapter.invalid())).toBe(true);
    expect(adapter.sameTime(adapter.createTime(1, 1), adapter.invalid())).toBe(false);
    expect(adapter.sameTime(adapter.createTime(1, 1), adapter.createTime(1, 1))).toBe(true);
    expect(adapter.sameTime(adapter.createTime(1, 1), adapter.createTime(0, 1))).toBe(false);
    expect(adapter.sameTime(null, null)).toBe(true);
  });

  it('should parse string', () => {
    expect(adapter.parse('22:30')).toEqual(newTime(22, 30));
  });

  it('should parse number', () => {
    expect(adapter.parse(1122)).toEqual(newTime(11, 22));
  });

  it('should parse Time', () => {
    const time = newTime(22, 55);
    expect(adapter.parse(time)).toEqual(time);
    expect(adapter.parse(time)).not.toBe(time);
  });

  it('should parse invalid value as invalid', () => {
    const t = adapter.parse('hello');
    expect(t).not.toBeNull();
    expect(adapter.isTimeInstance(t)).withContext('Expected string to have been fed through Time.parse').toBe(true);
    expect(adapter.isValid(t as Time))
      .withContext('Expected to parse as "invalid Time" object')
      .toBe(false);
  });

  it('should format', () => {
    expect(adapter.format(newTime(15, 30), {})).toEqual('15:30');
  });

  it('should format with custom format', () => {
    expect(
      adapter.format(newTime(15, 30), {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
    ).toEqual('3:30 PM');
  });

  // it('should format with a different locale', () => {
  //   adapter.setLocale('ja-JP');
  //   expect(adapter.format(newTime(14, 45), {})).toEqual('2017/1/1');
  // });

  it('should throw when attempting to format invalid Time', () => {
    expect(() => adapter.format(adapter.invalid(), {})).toThrowError(/ZvNativeTimeAdapter: Cannot format invalid Time\./);
  });

  //   it('should clone', () => {
  //     let Time = newTime(14, 45);
  //     expect(adapter.clone(Time)).toEqual(Time);
  //     expect(adapter.clone(Time)).not.toBe(Time);
  //   });

  it('should compare Times', () => {
    expect(adapter.compareTime(newTime(14, 45), newTime(14, 46))).toBeLessThan(0);
    expect(adapter.compareTime(newTime(14, 45), newTime(15, 45))).toBeLessThan(0);
    expect(adapter.compareTime(newTime(14, 45), newTime(14, 45))).toBe(0);
    expect(adapter.compareTime(newTime(15, 45), newTime(14, 45))).toBeGreaterThan(0);
    expect(adapter.compareTime(newTime(14, 46), newTime(14, 45))).toBeGreaterThan(0);
  });

  it('should count an invalid Time as an invalid Time instance', () => {
    const t = adapter.invalid();
    expect(adapter.isValid(t)).toBe(false);
    expect(adapter.isTimeInstance(t)).toBe(true);
  });

  it('should count a string as not a Time instance', () => {
    const t = '1/1/2017';
    expect(adapter.isTimeInstance(t)).toBe(false);
  });

  it('should provide a method to return a valid Time or null', () => {
    const t = newTime(10, 50);
    expect(adapter.getValidTimeOrNull(t)).toBe(t);
    expect(adapter.getValidTimeOrNull(adapter.invalid())).toBeNull();
    expect(adapter.getValidTimeOrNull(null)).toBeNull();
    expect(adapter.getValidTimeOrNull(undefined)).toBeNull();
    expect(adapter.getValidTimeOrNull('')).toBeNull();
    expect(adapter.getValidTimeOrNull(0)).toBeNull();
    expect(adapter.getValidTimeOrNull('Wed Jul 28 1993')).toBeNull();
    expect(adapter.getValidTimeOrNull('1595204418000')).toBeNull();
  });

  it('should create Times from valid ISO strings', () => {
    assertValidTime(adapter.deserialize('22:30'), true);
    assertValidTime(adapter.deserialize('23:59'), true);
    assertValidTime(adapter.deserialize('00:00'), true);
    expect(adapter.deserialize('')).toBeNull();
    expect(adapter.deserialize(null)).toBeNull();
    assertValidTime(adapter.deserialize(newTime(0, 0)), true);
    assertValidTime(adapter.deserialize(adapter.invalid()), false);
  });

  // eslint-disable-next-line jasmine/missing-expect
  it('should create an invalid Time', () => {
    assertValidTime(adapter.invalid(), false);
  });

  it('should not throw when attempting to format a Time with a hour less than 1', () => {
    expect(() => adapter.format(newTime(-1, 0), {})).not.toThrow();
  });

  it('should not throw when attempting to format a Time with a hour greater than 23', () => {
    expect(() => adapter.format(newTime(10000, 0), {})).not.toThrow();
  });

  it('should return localized format example', () => {
    expect(adapter.parseFormatExample()).toEqual('hh:mm');
  });
});

describe('ZvNativeTimeAdapter with LOCALE_ID override', () => {
  let adapter: ZvNativeTimeAdapter;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ZvTimeAdapter, useClass: ZvNativeTimeAdapter },
        { provide: LOCALE_ID, useValue: 'en-US' },
      ],
    }).compileComponents();
  }));

  beforeEach(inject([ZvTimeAdapter], (timeAdapter: ZvNativeTimeAdapter) => {
    adapter = timeAdapter;
  }));

  it('should return localized format example for other LOCALE_ID', () => {
    expect(adapter.parseFormatExample()).toEqual('hh:mm AM');
  });
});
