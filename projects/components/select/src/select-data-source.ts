import { Observable } from 'rxjs';
import { ZvSelectItem } from './models';

export const DEFAULT_COMPARER = (a: any, b: any) => a === b;

export abstract class ZvSelectDataSource<T = any> {
  /** The flag that indicates if the select is currently loading data. */
  public loading = false;

  /** The error that occured in the last observable returned by _loadItems or null. */
  public error: any = null;

  public compareWith: (value1: T, value2: T) => boolean = DEFAULT_COMPARER;

  /**
   * Connects a collection viewer (such as a data-table) to this data source. Note that
   * the stream provided will be accessed during change detection and should not directly change
   * values that are bound in template views.
   *
   * @returns Observable that emits a new value when the data changes.
   */
  public abstract connect(): Observable<ZvSelectItem<T>[] | ReadonlyArray<ZvSelectItem<T>>>;

  /**
   * Disconnects a collection viewer (such as a data-table) from this data source. Can be used
   * to perform any clean-up or tear-down operations when a view is being destroyed.
   */
  public abstract disconnect(): void;

  public abstract panelOpenChanged(panelOpen: boolean): void;
  public abstract searchTextChanged(searchText: string): void;
  public abstract selectedValuesChanged(values: T[]): void;
  public abstract getItemsForValues(values: T[]): ZvSelectItem<T>[];
}

/** Checks whether an object is a data source. */
export function isZvSelectDataSource(value: any): value is ZvSelectDataSource<any> {
  // Check if the value is a ZvSelectDataSource by observing if it has a connect function. Cannot
  // be checked as an `instanceof ZvSelectDataSource` since people could create their own sources
  // that match the interface, but don't extend ZvSelectDataSource.
  return value && typeof value.connect === 'function';
}
