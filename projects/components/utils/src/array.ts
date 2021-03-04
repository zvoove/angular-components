/**
 * Filters an array with a Promise as predicate
 * see: https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/
 */
export async function filterAsync<T>(array: T[], predicate: (item: T) => Promise<boolean>) {
  const results = await Promise.all(array.map(async (i) => await predicate(i)));
  return array.filter((_v, index) => results[index]);
}
