import { objectToKeyValueArray } from './object';

describe('objectToKeyValueArray', () => {
  it('should return an empty array when the input object is empty', () => {
    const input = {};
    const output = objectToKeyValueArray(input);

    expect(output).toEqual([]);
  });

  it('should return an array of key-value pairs when the input object is not empty', () => {
    const input = {
      firstName: 'John',
      lastName: 'Doe',
    };
    const output = objectToKeyValueArray(input);

    expect(output).toEqual([
      { key: 'firstName', value: 'John' },
      { key: 'lastName', value: 'Doe' },
    ]);
  });
});
