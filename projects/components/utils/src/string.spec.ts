import { replaceAll } from './string';

describe('string utils', () => {
  it('replaceAll should work', () => {
    // use cases in number-input
    expect(replaceAll('5,000,000.00', ',', '')).toEqual('5000000.00');
    expect(replaceAll('5000000.00', '.', '.')).toEqual('5000000.00');

    expect(replaceAll('5.000.000,00', '.', '')).toEqual('5000000,00');
    expect(replaceAll('5000000,00', ',', '.')).toEqual('5000000.00');

    // general use case
    expect(replaceAll('1 abc 2 abc 3 bcd 4 abc 5', 'abc', 'xyz')).toEqual('1 xyz 2 xyz 3 bcd 4 xyz 5');
  });
});
