import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { TrackByFunction } from '@angular/core';
import { BehaviorSubject, NEVER, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';
import { _isNumberValue } from '../helper/table.helper';
import { IExtendedZvTableUpdateDataInfo, IZvTableAction, IZvTableUpdateDataInfo, ZvTableActionScope } from '../models';
/**
 * Corresponds to `Number.MAX_SAFE_INTEGER`. Moved out into a variable here due to
 * flaky browser support and the value not being defined in Closure's typings.
 */
const MAX_SAFE_INTEGER = 9007199254740991;

export interface ZvTableDataSourceOptions<TData, TTrigger = any> {
  loadTrigger$?: Observable<TTrigger>;
  loadDataFn: (updateInfo: IExtendedZvTableUpdateDataInfo<TTrigger>) => Observable<TData[] | IZvTableFilterResult<TData>>;
  loadRowActionFn?: (data: TData, actions: IZvTableAction<TData>[]) => Observable<IZvTableAction<TData>[]>;
  openRowMenuActionFn?: (
    data: TData,
    actions: IZvTableAction<TData>[]
  ) => Observable<IZvTableAction<TData>[]> | IZvTableAction<any>[] | null;
  actions?: IZvTableAction<TData>[];
  mode?: ZvTableMode;
  moreMenuThreshold?: number;
}

export interface IZvTableFilterResult<T> {
  items: T[];
  totalItems: number;
}

export declare type ZvTableMode = 'client' | 'server';

export class ZvTableDataSource<T, TTrigger = any> extends DataSource<T> {
  /** Subject that emits, when the table should be checked by the change detection */
  public _internalDetectChanges = new Subject<void>();

  /** Array of data that should be rendered by the table, where each object represents one row. */
  public get data() {
    return this._data.value;
  }
  public set data(data: T[]) {
    this._data.next(data);
  }

  public readonly selectionModel = new SelectionModel<T>(true, []);

  /** The currently visible rows. */
  public get visibleRows(): T[] {
    return this._renderData.value;
  }

  /** The flag that indicates if all visible rows are selected. */
  public get allVisibleRowsSelected(): boolean {
    return this.visibleRows.length === this.selectionModel.selected.length;
  }

  /** The flag that indicates if the table is currently loading data. */
  public loading = true;

  /** The error that occured in the last observable returned by loadData or null. */
  public error: any = null;

  /** The locale for the table texts. */
  public locale: string;

  /** The length of the total number of items that are being paginated. Defaulted to 0. */
  public dataLength = 0;

  /** The name of the column, after which the rows should be sorted. Defaulted to asc. */
  public sortColumn: string = null;

  /** The sort direction. Defaulted to asc. */
  public sortDirection: 'asc' | 'desc' = 'asc';

  /** The zero-based page index of the displayed list of items. Defaulted to 0. */
  public pageIndex = 0;

  /** Number of items to display on a page. By default set to 15. */
  public pageSize = 15;

  /**
   * Filter term that should be used to filter out objects from the data array. To override how
   * data objects match to this filter string, provide a custom function for filterPredicate.
   */
  public filter = '';

  /** Indicates if the table is ready. As long as this is false, any updateData calls can be ignored */
  public tableReady = false;

  /** Controls if the data sould be paged, filtered and sorted on the client or the server */
  public readonly mode: ZvTableMode;

  /** List of actions which can be executed for a single row */
  public readonly rowActions: IZvTableAction<T>[];

  /** List of actions which can be executed for a selection of rows */
  public readonly listActions: IZvTableAction<T>[];

  /** Component action init or changes callback of actions which can be executed for a selection of rows */
  public readonly loadRowActionFn: (data: T, actions: IZvTableAction<T>[]) => Observable<IZvTableAction<T>[]>;

  /** Component open callbacks of actions which can be executed for a selection of rows */
  public readonly openMenuRowActionFn: (
    data: T,
    actions: IZvTableAction<T>[]
  ) => Observable<IZvTableAction<T>[]> | IZvTableAction<any>[] | null;

  public readonly moreMenuThreshold: number;

  /** Stream that emits when a new data array is set on the data source. */
  private readonly _updateDataTrigger$: Observable<any>;

  private readonly _loadData: (updateInfo: IExtendedZvTableUpdateDataInfo<TTrigger>) => Observable<T[] | IZvTableFilterResult<T>>;

  /** Stream that emits when a new data array is set on the data source. */
  private readonly _data: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);

  /** Stream emitting render data to the table (depends on ordered data changes). */
  private readonly _renderData = new BehaviorSubject<T[]>([]);

  /** Indicates if the data source currently holds data provided by the _loadData function. */
  private _hasData = false;

  private _lastLoadTriggerData: TTrigger = null;

  /**
   * Subscription to the result of the loadData function.
   */
  private _loadDataSubscription = Subscription.EMPTY;

  /**
   * Subscription to the updateDataTrigger$ of the options.
   */
  private _updateDataTriggerSub = Subscription.EMPTY;

  /**
   * Subscription to the changes that should trigger an update to the table's rendered rows.
   */
  private _renderChangesSubscription = Subscription.EMPTY;

  constructor(
    optionsOrLoadDataFn:
      | ZvTableDataSourceOptions<T, TTrigger>
      | ((updateInfo: IExtendedZvTableUpdateDataInfo<TTrigger>) => Observable<T[] | IZvTableFilterResult<T>>),
    mode?: ZvTableMode
  ) {
    super();
    const options: ZvTableDataSourceOptions<T, TTrigger> =
      'loadDataFn' in optionsOrLoadDataFn ? optionsOrLoadDataFn : { loadDataFn: optionsOrLoadDataFn, actions: [], mode: mode };

    this.mode = options.mode || 'client';
    // eslint-disable-next-line no-bitwise
    this.rowActions = options.actions?.filter((a) => a.scope & ZvTableActionScope.row) || [];
    // eslint-disable-next-line no-bitwise
    this.listActions = options.actions?.filter((a) => a.scope & ZvTableActionScope.list) || [];
    this._updateDataTrigger$ = options.loadTrigger$ || NEVER;
    this._loadData = options.loadDataFn;
    this.loadRowActionFn = options.loadRowActionFn;
    this.openMenuRowActionFn = options.openRowMenuActionFn;
    this.moreMenuThreshold = options.moreMenuThreshold ?? 3;
  }

  /**
   * Tracking function that will be used to check the differences in data changes.
   * Used similarly to ngFor trackBy function. Optimize row operations by identifying a row based
   * on its data relative to the function to know if a row should be added/removed/moved.
   * Accepts a function that takes two parameters, index and item.
   */
  public trackBy: TrackByFunction<T> = (i) => i; // index is more performant than item reference when paginating

  /**
   * Returns the names of the property that should be used in filterPredicate.
   *
   * @param row Data object for which the property names should be returned.
   * @returns The names of the properties to use in the filter.
   */
  public filterProperties(row: { [key: string]: any }): string[] {
    return Object.keys(row);
  }

  /**
   * Returns all values that should be used for filtering.
   *
   * @param row Data object used to check against the filter.
   * @returns The values to use in the filter.
   */
  public filterValues = (row: { [key: string]: any }): any[] => this.filterProperties(row).map((key) => row[key]);

  /**
   * Checks if a data object matches the data source's filter string. By default, each data object
   * is converted to a string of its properties and returns true if the filter has
   * at least one occurrence in that string. By default, the filter string has its whitespace
   * trimmed and the match is case-insensitive. May be overridden for a custom implementation of
   * filter matching.
   *
   * @param row Data object used to check against the filter.
   * @param filter Filter string that has been set on the data source.
   * @returns Whether the filter matches against the data
   */
  public filterPredicate = (row: { [key: string]: any }, filter: string) => {
    // Transform the data into a lowercase string of all property values.
    const dataStr = this.filterValues(row)
      .map((value) => (value instanceof Date ? value.toLocaleString(this.locale) : value + '').toLowerCase())
      // Use an obscure Unicode character to delimit the words in the concatenated string.
      // This avoids matches where the values of two columns combined will match the user's query
      // (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
      // that has a very low chance of being typed in by somebody in a text field. This one in
      // particular is "White up-pointing triangle with dot" from
      // https://en.wikipedia.org/wiki/List_of_Unicode_characters
      .join('◬');

    // Transform the filter by converting it to lowercase.
    const transformedFilter = filter.toLowerCase();
    return dataStr.indexOf(transformedFilter) !== -1;
  };

  /**
   * Data accessor function that is used for accessing data properties for sorting through
   * the default sortData function.
   * This default function assumes that the sort header IDs (which defaults to the column name)
   * matches the data's properties (e.g. column Xyz represents data['Xyz']).
   * May be set to a custom function for different behavior.
   *
   * @param data Data object that is being accessed.
   * @param columnName The name of the column that represents the data.
   */
  public sortingDataAccessor = (data: T, columnName: string): any => {
    const value = (data as { [key: string]: any })[columnName];

    if (_isNumberValue(value)) {
      const numberValue = Number(value);

      // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
      // leave them as strings. For more info: https://goo.gl/y5vbSg
      return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
    }

    return value;
  };

  /**
   * Gets a sorted copy of the data array based on the state of the MatSort. Called
   * after changes are made to the filtered data or when sort changes are emitted from MatSort.
   * By default, the function retrieves the active sort and its direction and compares data
   * by retrieving data using the sortingDataAccessor. May be overridden for a custom implementation
   * of data ordering.
   *
   * @param data The array of data that should be sorted.
   * @param sort The connected MatSort that holds the current sort state.
   */
  public sortData = (data: T[], sort: { sortColumn: string; sortDirection: 'asc' | 'desc' }): T[] => {
    const sortProp = sort.sortColumn;
    const sortDir = sort.sortDirection;
    if (!sortProp || !sortDir) {
      return data;
    }

    return data.sort((a: T, b: T) => {
      let valueA = this.sortingDataAccessor(a, sortProp);
      let valueB = this.sortingDataAccessor(b, sortProp);

      // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
      // one value exists while the other doesn't. In this case, existing value should come first.
      // This avoids inconsistent results when comparing values to undefined/null.
      // If neither value exists, return 0 (equal).
      let comparatorResult = 0;
      if (valueA != null && valueB != null) {
        if (valueA instanceof Date || valueB instanceof Date) {
          valueA = new Date(valueA).toISOString();
          valueB = new Date(valueB).toISOString();
        }

        const propertyType = typeof valueA;
        if (propertyType === 'string') {
          comparatorResult = valueA.localeCompare(valueB);
        }
        // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
        else if (valueA > valueB) {
          comparatorResult = 1;
        } else if (valueA < valueB) {
          comparatorResult = -1;
        }
      } else if (valueA != null) {
        comparatorResult = 1;
      } else if (valueB != null) {
        comparatorResult = -1;
      }

      return comparatorResult * (sortDir === 'asc' ? 1 : -1);
    });
  };

  /**
   * Returns the current page, sort and filter state
   */
  public getUpdateDataInfo(extended?: false): IZvTableUpdateDataInfo;
  public getUpdateDataInfo(extended: true): IExtendedZvTableUpdateDataInfo<TTrigger>;
  public getUpdateDataInfo(extended = false): IZvTableUpdateDataInfo | IExtendedZvTableUpdateDataInfo<TTrigger> {
    const data: IZvTableUpdateDataInfo = {
      pageSize: this.pageSize,
      currentPage: this.pageIndex,
      searchText: this.filter,
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection,
    };
    if (extended) {
      (data as IExtendedZvTableUpdateDataInfo<TTrigger>).triggerData = this._lastLoadTriggerData;
    }
    return data;
  }

  /**
   * Reloads the data
   */
  public updateData(forceReload = true) {
    if (!this.tableReady) {
      return;
    }

    if (this.mode === 'server' || forceReload || !this._hasData) {
      this.selectionModel.clear();
      this._loadDataSubscription.unsubscribe();
      this.error = null;
      this.loading = true;
      this._internalDetectChanges.next();

      const updateInfo = this.getUpdateDataInfo(true);
      this._loadDataSubscription = this._loadData(updateInfo)
        .pipe(
          take(1),
          tap(() => (this._hasData = true)),
          catchError((err: Error | any) => {
            this._hasData = false;
            this.error = err;
            return of([] as T[]);
          }),
          finalize(() => {
            this.loading = false;
            this._internalDetectChanges.next();
          })
        )
        .subscribe((data) => {
          if (Array.isArray(data)) {
            this.dataLength = data.length;
            this.data = data;
          } else {
            const filterResult = data;

            this.dataLength = filterResult.totalItems;
            this.data = filterResult.items;
            this._checkPageValidity(filterResult.totalItems);
          }
        });
    } else if (!this.loading) {
      this.selectionModel.clear();
      this._data.next(this.data);
      this._internalDetectChanges.next();
    }
  }

  /**
   * Selects all visible rows
   */
  public selectVisibleRows() {
    this.selectionModel.select(...this.visibleRows);
  }

  /**
   * Toggle the selection of the visible rows
   */
  public toggleVisibleRowSelection() {
    if (this.allVisibleRowsSelected) {
      this.selectionModel.clear();
    } else {
      this.selectVisibleRows();
    }
  }

  /**
   * Used by the MatTable. Called when it connects to the data source.
   *
   * @docs-private
   */
  public connect() {
    this._initDataChangeSubscription();
    this._updateDataTriggerSub = this._updateDataTrigger$.subscribe((data) => {
      this._lastLoadTriggerData = data;
      this.updateData();
    });
    return this._renderData;
  }

  /**
   * Used by the MatTable. Called when it is destroyed. No-op.
   *
   * @docs-private
   */
  public disconnect() {
    this._renderChangesSubscription.unsubscribe();
    this._updateDataTriggerSub.unsubscribe();
    this._loadDataSubscription.unsubscribe();
  }

  /**
   * Subscribe to changes that should trigger an update to the table's rendered rows. When the
   * changes occur, process the current state of the filter, sort, and pagination along with
   * the provided base data and send it to the table for rendering.
   */
  private _initDataChangeSubscription() {
    let dataStream: Observable<T[]> = this._data;
    if (this.mode === 'client') {
      dataStream = dataStream.pipe(
        map((data) => this._filterData(data)),
        map((data) => this._orderData(data)),
        map((data) => this._pageData(data))
      );
    }
    this._renderChangesSubscription.unsubscribe();
    this._renderChangesSubscription = dataStream.subscribe((data) => this._renderData.next(data));
  }

  /**
   * Returns a filtered data array where each filter object contains the filter string within
   * the result of the filterTermAccessor function. If no filter is set, returns the data array
   * as provided.
   */
  private _filterData(data: T[]) {
    // If there is a filter string, filter out data that does not contain it.
    // Each data object is converted to a string using the function defined by filterTermAccessor.
    // May be overridden for customization.
    const filteredData = !this.filter ? data : data.filter((obj) => this.filterPredicate(obj, this.filter));

    this.dataLength = filteredData.length;

    this._checkPageValidity(filteredData.length);

    return filteredData;
  }

  /**
   * Returns a sorted copy of the data if MatSort has a sort applied, otherwise just returns the
   * data array as provided. Uses the default data accessor for data lookup, unless a
   * sortDataAccessor function is defined.
   */
  private _orderData(data: T[]): T[] {
    // If there is no active sort or direction, return the data without trying to sort.
    if (!this.sortColumn) {
      return data;
    }

    return this.sortData(data.slice(), {
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection,
    });
  }

  /**
   * Returns a paged splice of the provided data array according to the provided MatPaginator's page
   * index and length. If there is no paginator provided, returns the data array as provided.
   */
  private _pageData(data: T[]): T[] {
    const startIndex = this.pageIndex * this.pageSize;
    return data.slice().splice(startIndex, this.pageSize);
  }

  /**
   * Checks if the current pageIndex is 0 or the page contains data, otherwise it switches to the last valid page.
   * Please make sure that dataLength
   */
  private _checkPageValidity(totalItems: number) {
    // If the page index is set beyond the page, reduce it to the last page.
    if (this.pageIndex > 0) {
      const lastPageIndex = totalItems ? Math.ceil(totalItems / this.pageSize) - 1 : 0;
      const newPageIndex = Math.min(this.pageIndex, lastPageIndex);

      if (newPageIndex !== this.pageIndex) {
        this.pageIndex = newPageIndex;
        this.updateData();
      }
    }
  }
}
