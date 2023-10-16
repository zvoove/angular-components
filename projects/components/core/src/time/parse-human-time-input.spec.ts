import { parseHumanTimeInput } from './parse-human-time-input';

describe('parseHumanTimeInput', () => {
  it('should reject >4 digits', () => {
    expect(parseHumanTimeInput('00000')).toEqual(NaN);
    expect(parseHumanTimeInput('0:0000')).toEqual(NaN);
    expect(parseHumanTimeInput('00:000')).toEqual(NaN);
    expect(parseHumanTimeInput('000:00')).toEqual(NaN);
    expect(parseHumanTimeInput('0000:0')).toEqual(NaN);
    expect(parseHumanTimeInput('0000000')).toEqual(NaN);
  });

  it('should reject garbage', () => {
    expect(parseHumanTimeInput('asdf')).toEqual(NaN);
  });

  describe('24 hours', () => {
    it('should parse : separated', () => {
      expect(parseHumanTimeInput('0:0')).toEqual([0, 0]);
      expect(parseHumanTimeInput('0:40')).toEqual([0, 40]);
      expect(parseHumanTimeInput('23:59')).toEqual([23, 59]);
      expect(parseHumanTimeInput('24:30')).toEqual(NaN);
      expect(parseHumanTimeInput('23:61')).toEqual(NaN);
    });
    it('should parse 4 digits', () => {
      expect(parseHumanTimeInput('0000')).toEqual([0, 0]);
      expect(parseHumanTimeInput('0040')).toEqual([0, 40]);
      expect(parseHumanTimeInput('2359')).toEqual([23, 59]);
      expect(parseHumanTimeInput('2430')).toEqual(NaN);
      expect(parseHumanTimeInput('2361')).toEqual(NaN);
    });
    it('should parse 3 digits', () => {
      expect(parseHumanTimeInput('000')).toEqual([0, 0]);
      expect(parseHumanTimeInput('040')).toEqual([0, 40]);
      expect(parseHumanTimeInput('259')).toEqual([2, 59]);
      expect(parseHumanTimeInput('261')).toEqual(NaN);
    });
    it('should parse 2 digits', () => {
      expect(parseHumanTimeInput('00')).toEqual([0, 0]);
      expect(parseHumanTimeInput('11')).toEqual([11, 0]);
      expect(parseHumanTimeInput('23')).toEqual([23, 0]);
      expect(parseHumanTimeInput('25')).toEqual(NaN);
    });
    it('should parse 1 digit', () => {
      expect(parseHumanTimeInput('0')).toEqual([0, 0]);
      expect(parseHumanTimeInput('1')).toEqual([1, 0]);
      expect(parseHumanTimeInput('2')).toEqual([2, 0]);
      expect(parseHumanTimeInput('9')).toEqual([9, 0]);
    });
  });

  describe('12 hours AM', () => {
    it('should parse : separated (AM)', () => {
      expect(parseHumanTimeInput('0:0am')).toEqual([0, 0]);
      expect(parseHumanTimeInput('0:40am')).toEqual([0, 40]);
      expect(parseHumanTimeInput('7:59am')).toEqual([7, 59]);
      expect(parseHumanTimeInput('13:30am')).toEqual(NaN);
      expect(parseHumanTimeInput('23:61am')).toEqual(NaN);
    });
    it('should parse 4 digits (AM)', () => {
      expect(parseHumanTimeInput('0000 am')).toEqual([0, 0]);
      expect(parseHumanTimeInput('0840 am')).toEqual([8, 40]);
    });
    it('should parse 3 digits (AM)', () => {
      expect(parseHumanTimeInput('000 am')).toEqual([0, 0]);
      expect(parseHumanTimeInput('040 am')).toEqual([0, 40]);
      expect(parseHumanTimeInput('259 am')).toEqual([2, 59]);
      expect(parseHumanTimeInput('261 am')).toEqual(NaN);
    });
    it('should parse 2 digits (AM)', () => {
      expect(parseHumanTimeInput('00 am')).toEqual([0, 0]);
      expect(parseHumanTimeInput('11 am')).toEqual([11, 0]);
      expect(parseHumanTimeInput('13 am')).toEqual(NaN);
    });

    it('should ignore am for 00:00 - 11:59', () => {
      expect(parseHumanTimeInput('00:00am')).toEqual([0, 0]);
      expect(parseHumanTimeInput('11:59am')).toEqual([11, 59]);
      expect(parseHumanTimeInput('9:30AM')).toEqual([9, 30]);
      expect(parseHumanTimeInput('9:3AM')).toEqual([9, 3]);
    });

    it('should treat 12:xx am as 00:xx', () => {
      expect(parseHumanTimeInput('12:30 am')).toEqual([0, 30]);
      expect(parseHumanTimeInput('12:59 am')).toEqual([0, 59]);
    });

    it('should treat 13:xx am as NaN', () => {
      expect(parseHumanTimeInput('13:00 am')).toEqual(NaN);
    });
  });

  describe('12 hours PM', () => {
    it('should parse : separated (PM)', () => {
      expect(parseHumanTimeInput('0:0pm')).toEqual([12, 0]);
      expect(parseHumanTimeInput('0:40pm')).toEqual([12, 40]);
      expect(parseHumanTimeInput('7:59pm')).toEqual([19, 59]);
      expect(parseHumanTimeInput('13:30pm')).toEqual(NaN);
      expect(parseHumanTimeInput('23:61pm')).toEqual(NaN);
    });
    it('should parse 4 digits (PM)', () => {
      expect(parseHumanTimeInput('0000 pm')).toEqual([12, 0]);
      expect(parseHumanTimeInput('0840 pm')).toEqual([20, 40]);
    });
    it('should parse 3 digits (PM)', () => {
      expect(parseHumanTimeInput('000 pm')).toEqual([12, 0]);
      expect(parseHumanTimeInput('040 pm')).toEqual([12, 40]);
      expect(parseHumanTimeInput('259 pm')).toEqual([14, 59]);
      expect(parseHumanTimeInput('261 pm')).toEqual(NaN);
    });
    it('should parse 2 digits (PM)', () => {
      expect(parseHumanTimeInput('00 pm')).toEqual([12, 0]);
      expect(parseHumanTimeInput('11 pm')).toEqual([23, 0]);
      expect(parseHumanTimeInput('13 pm')).toEqual(NaN);
    });

    it('should add 12 hours for 00:00 - 11:59 pm', () => {
      expect(parseHumanTimeInput('00:00pm')).toEqual([12, 0]);
      expect(parseHumanTimeInput('11:59pm')).toEqual([23, 59]);
      expect(parseHumanTimeInput('9:30PM')).toEqual([21, 30]);
      expect(parseHumanTimeInput('9:3PM')).toEqual([21, 3]);
    });

    it('should treat 12:xx pm as 12:xx', () => {
      expect(parseHumanTimeInput('12:30 pm')).toEqual([12, 30]);
      expect(parseHumanTimeInput('12:59 pm')).toEqual([12, 59]);
    });

    it('should treat 13:xx pm as NaN', () => {
      expect(parseHumanTimeInput('13:00 pm')).toEqual(NaN);
    });
  });
});
