import { INVALID_DATE, detectDmyOrder, parseHumanDateInput } from './parse-human-date-input';

describe('detectDmyOrder', () => {
  it('should return dmy for de-DE', () => {
    expect(detectDmyOrder('de-DE')).toEqual(['d', 'm', 'y']);
  });
  it('should return mdy for en-US', () => {
    expect(detectDmyOrder('en-US')).toEqual(['m', 'd', 'y']);
  });
  it('should return dmy for en-GB', () => {
    expect(detectDmyOrder('en-GB')).toEqual(['d', 'm', 'y']);
  });
});

function sut2020Dmy(value: unknown) {
  return parseHumanDateInput(2020, ['d', 'm', 'y'], value);
}
const buildDate = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe('parseHumanDateInput', () => {
  it('should expand year only 10 years to the future', () => {
    expect(parseHumanDateInput(2010, ['d', 'm', 'y'], '010121')).toEqual(buildDate(1921, 1, 1));
    expect(parseHumanDateInput(2011, ['d', 'm', 'y'], '010121')).toEqual(buildDate(2021, 1, 1));
  });

  it('should accept 6 digits as ddmmyy, check for bounds and expand year', () => {
    expect(sut2020Dmy('101192')).toEqual(buildDate(1992, 11, 10));
    expect(sut2020Dmy('010516')).toEqual(buildDate(2016, 5, 1));

    // month out of bounds
    expect(sut2020Dmy('011316')).toBe(INVALID_DATE);

    // day out of bounds
    expect(sut2020Dmy('320516')).toBe(INVALID_DATE);

    // up to 10 years in the future -> use this century
    expect(sut2020Dmy('010520')).toEqual(buildDate(2020, 5, 1));
    expect(sut2020Dmy('010525')).toEqual(buildDate(2025, 5, 1));
    expect(sut2020Dmy('010530')).toEqual(buildDate(2030, 5, 1));

    // year more than 10 years in the future -> use last century
    expect(sut2020Dmy('010531')).toEqual(buildDate(1931, 5, 1));
    expect(sut2020Dmy('010540')).toEqual(buildDate(1940, 5, 1));
    expect(sut2020Dmy('010550')).toEqual(buildDate(1950, 5, 1));
    expect(sut2020Dmy('010560')).toEqual(buildDate(1960, 5, 1));
    expect(sut2020Dmy('010570')).toEqual(buildDate(1970, 5, 1));
    expect(sut2020Dmy('010580')).toEqual(buildDate(1980, 5, 1));
    expect(sut2020Dmy('010590')).toEqual(buildDate(1990, 5, 1));
    expect(sut2020Dmy('010599')).toEqual(buildDate(1999, 5, 1));
  });

  it(`should accept 7 digits as ddmmyyy, check for bounds but don't expand year`, () => {
    expect(sut2020Dmy('1011992')).toEqual(buildDate(992, 11, 10));
    expect(sut2020Dmy('0105016')).toEqual(buildDate(16, 5, 1));

    // month out of bounds
    expect(sut2020Dmy('0113016')).toBe(INVALID_DATE);

    // day out of bounds
    expect(sut2020Dmy('3205016')).toBe(INVALID_DATE);
  });

  it('should accept 8 digits as ddmmyyyy and check for bounds', () => {
    expect(sut2020Dmy('10111992')).toEqual(buildDate(1992, 11, 10));
    expect(sut2020Dmy('01052016')).toEqual(buildDate(2016, 5, 1));

    // month out of bounds
    expect(sut2020Dmy('0113016')).toBe(INVALID_DATE);

    // day out of bounds
    expect(sut2020Dmy('3205016')).toBe(INVALID_DATE);
  });

  it(`should accept '.' separated date`, () => {
    expect(sut2020Dmy('1.5.2')).toEqual(buildDate(2002, 5, 1));
    expect(sut2020Dmy('01.05.20')).toEqual(buildDate(2020, 5, 1));
    expect(sut2020Dmy('01.05.530')).toEqual(buildDate(530, 5, 1));
    expect(sut2020Dmy('01.05.1870')).toEqual(buildDate(1870, 5, 1));

    // month out of bounds
    expect(sut2020Dmy('01.13.16')).toBe(INVALID_DATE);

    // day out of bounds
    expect(sut2020Dmy('32.05.16')).toBe(INVALID_DATE);

    // up to 10 years in the future -> use this century
    expect(sut2020Dmy('01.05.30')).toEqual(buildDate(2030, 5, 1));

    // year more than 10 years in the future -> use last century
    expect(sut2020Dmy('01.05.31')).toEqual(buildDate(1931, 5, 1));
  });

  it(`should accept '/' separated date`, () => {
    expect(sut2020Dmy('1/5/2')).toEqual(buildDate(2002, 5, 1));
    expect(sut2020Dmy('01/05/20')).toEqual(buildDate(2020, 5, 1));
    expect(sut2020Dmy('01/05/530')).toEqual(buildDate(530, 5, 1));
    expect(sut2020Dmy('01/05/1870')).toEqual(buildDate(1870, 5, 1));

    // month out of bounds
    expect(sut2020Dmy('01/13/16')).toBe(INVALID_DATE);

    // day out of bounds
    expect(sut2020Dmy('32/05/16')).toBe(INVALID_DATE);

    // up to 10 years in the future -> use this century
    expect(sut2020Dmy('01/05/30')).toEqual(buildDate(2030, 5, 1));

    // year more than 10 years in the future -> use last century
    expect(sut2020Dmy('01/05/31')).toEqual(buildDate(1931, 5, 1));
  });

  it(`should accept ' ' separated date`, () => {
    expect(sut2020Dmy('1 5 2')).toEqual(buildDate(2002, 5, 1));
    expect(sut2020Dmy('01 05 20')).toEqual(buildDate(2020, 5, 1));
    expect(sut2020Dmy('01 05 530')).toEqual(buildDate(530, 5, 1));
    expect(sut2020Dmy('01 05 1870')).toEqual(buildDate(1870, 5, 1));

    // month out of bounds
    expect(sut2020Dmy('01 13 16')).toBe(INVALID_DATE);

    // day out of bounds
    expect(sut2020Dmy('32 05 16')).toBe(INVALID_DATE);

    // up to 10 years in the future -> use this century
    expect(sut2020Dmy('01 05 30')).toEqual(buildDate(2030, 5, 1));

    // year more than 10 years in the future -> use last century
    expect(sut2020Dmy('01 05 31')).toEqual(buildDate(1931, 5, 1));
  });

  it(`should accept ',' separated date`, () => {
    expect(sut2020Dmy('1,5,2')).toEqual(buildDate(2002, 5, 1));
    expect(sut2020Dmy('01,05,20')).toEqual(buildDate(2020, 5, 1));
    expect(sut2020Dmy('01,05,530')).toEqual(buildDate(530, 5, 1));
    expect(sut2020Dmy('01,05,1870')).toEqual(buildDate(1870, 5, 1));

    // month out of bounds
    expect(sut2020Dmy('01,13,16')).toBe(INVALID_DATE);

    // day out of bounds
    expect(sut2020Dmy('32,05,16')).toBe(INVALID_DATE);

    // up to 10 years in the future -> use this century
    expect(sut2020Dmy('01,05,30')).toEqual(buildDate(2030, 5, 1));

    // year more than 10 years in the future -> use last century
    expect(sut2020Dmy('01,05,31')).toEqual(buildDate(1931, 5, 1));
  });

  it('should interpret 6 digits as mmddyy if order is mdy', () => {
    expect(parseHumanDateInput(2020, ['m', 'd', 'y'], '112277')).toEqual(buildDate(1977, 11, 22));
  });

  it("should interpret '/' separated date correctly if order is mdy", () => {
    expect(parseHumanDateInput(2020, ['m', 'd', 'y'], '11/22/77')).toEqual(buildDate(1977, 11, 22));
  });

  it('should interpret 6 digits as yymmdd if order is ymd', () => {
    expect(parseHumanDateInput(2020, ['y', 'm', 'd'], '771122')).toEqual(buildDate(1977, 11, 22));
  });

  it("should interpret '/' separated date correctly if order is ymd", () => {
    expect(parseHumanDateInput(2020, ['y', 'm', 'd'], '77/11/22')).toEqual(buildDate(1977, 11, 22));
  });
});
