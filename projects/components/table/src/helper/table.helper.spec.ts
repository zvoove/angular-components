import { IPsTableUpdateDataInfo } from '../models';
import { asQueryParams, fromQueryParams, _isNumberValue } from './table.helper';

describe('asQueryParams', () => {
  it('createsQueryParamsString', () => {
    const paramsString = asQueryParams({
      pageSize: 22,
      currentPage: 2,
      searchText: 'asdf',
      sortColumn: 'Column1',
      sortDirection: 'desc',
    });

    expect(paramsString).toEqual('22◬2◬asdf◬Column1◬desc');
  });
});

describe('fromQueryParams', () => {
  it('should return data when all values are valid', () => {
    expect(fromQueryParams('22◬2◬asdf◬Column1◬desc')).toEqual(<IPsTableUpdateDataInfo>{
      pageSize: 22,
      currentPage: 2,
      searchText: 'asdf',
      sortColumn: 'Column1',
      sortDirection: 'desc',
    });
  });

  it('should never return NaN for a parameter', () => {
    expect(fromQueryParams('foo◬foo◬asdf◬Column1◬desc')).toEqual(<IPsTableUpdateDataInfo>{
      pageSize: null,
      currentPage: null,
      searchText: 'asdf',
      sortColumn: 'Column1',
      sortDirection: 'desc',
    });
  });

  it('should return partial data when some values are set', () => {
    expect(fromQueryParams('22◬2◬◬◬desc')).toEqual(<IPsTableUpdateDataInfo>{
      pageSize: 22,
      currentPage: 2,
      searchText: null,
      sortColumn: null,
      sortDirection: 'desc',
    });

    expect(fromQueryParams('◬◬test◬◬')).toEqual(<IPsTableUpdateDataInfo>{
      pageSize: null,
      currentPage: null,
      searchText: 'test',
      sortColumn: null,
      sortDirection: null,
    });
  });

  it('should return undefined when all values are empty', () => {
    expect(fromQueryParams('◬◬◬◬')).toBe(undefined);
  });

  it('should return undefined when the input is empty', () => {
    expect(fromQueryParams('')).toBe(undefined);
    expect(fromQueryParams(null)).toBe(undefined);
    expect(fromQueryParams(undefined)).toBe(undefined);
  });
});

describe('_isNumberValue', () => {
  it('should only return true for numbers or string numbers', () => {
    expect(_isNumberValue(null)).toBe(false);
    expect(_isNumberValue(undefined)).toBe(false);
    expect(_isNumberValue('')).toBe(false);
    expect(_isNumberValue('safsa')).toBe(false);
    expect(_isNumberValue(true)).toBe(false);
    expect(_isNumberValue(false)).toBe(false);
    expect(_isNumberValue([])).toBe(false);
    expect(_isNumberValue({})).toBe(false);
    expect(_isNumberValue('123hello')).toBe(false);

    expect(_isNumberValue('123')).toBe(true);
    expect(_isNumberValue(123)).toBe(true);
    expect(_isNumberValue(123.5)).toBe(true);
    expect(_isNumberValue('123.5')).toBe(true);
  });
});
