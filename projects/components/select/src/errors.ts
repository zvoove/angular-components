/**
 * Returns an error that should be thrown when the data source does not match the compatible types.
 * @docs-private
 */
export function getSelectUnknownDataSourceError() {
  return Error('The provided data source did not match any of the compatible types (array, Observable, DataSource)');
}
