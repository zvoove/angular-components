import { filterAsync } from './array';

describe('filterAsync', () => {
  it('should filter the array based on the predicate function', async () => {
    const mockArray = [1, 2, 3, 4, 5];
    const mockPredicate = (item: number) => Promise.resolve(item % 2 === 0);

    const filteredArray = await filterAsync(mockArray, mockPredicate);

    expect(filteredArray).toEqual([2, 4]);
  });
});
