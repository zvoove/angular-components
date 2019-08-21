import { DefaultFormatter } from './formatter';

describe('DefaultFormatter', () => {
  it('should convert strings to numbers', () => {
    const formatter = new DefaultFormatter();

    expect(formatter.from('1')).toBe(1);
    expect(formatter.from('1.5')).toBe(1.5);
    expect(formatter.from('3.33333')).toBe(3.33333);
  });
  it('should convert numbers to strings with max 2 decimals', () => {
    const formatter = new DefaultFormatter();

    expect(formatter.to(1)).toBe('1');
    expect(formatter.to(1.5)).toBe('1.5');
    expect(formatter.to(3.33333)).toBe('3.33');
    expect(formatter.to(6.666)).toBe('6.67');
  });
});
