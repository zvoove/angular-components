import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { TrackByFunction } from '@angular/core';
import { Observable } from 'rxjs';

export interface IZvTableSortDefinition {
  prop: string;
  displayName: string;
}

export interface IZvTableSort {
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
}

export interface IZvTableUpdateDataInfo {
  currentPage: number | null;
  pageSize: number | null;
  searchText: string | null;
  sortDirection: 'asc' | 'desc' | null;
  sortColumn: string | null;
}

export const enum ZvTableActionScope {
  row = 1,
  list = 2,
  // eslint-disable-next-line no-bitwise
  all = row | list,
}

export interface IZvTableAction<T> {
  label: string;
  icon: string;
  isSvgIcon?: boolean;
  iconColor?: string;
  children?: IZvTableAction<T>[];
  scope: ZvTableActionScope;
  isDisabledFn?: (items: T[]) => boolean;
  isHiddenFn?: (items: T[]) => boolean;
  actionFn?: (items: T[]) => void;
  routerLink?: (item: T[]) => IZvTableActionRouterLink;
}

export interface IZvTableActionRouterLink {
  path: string[];
  queryParams?: { [key: string]: any };
}

export interface ITableDataSource<T> extends DataSource<T> {
  readonly _internalDetectChanges?: Observable<void>;

  readonly selectionModel: SelectionModel<T>;

  /** The currently visible rows. */
  readonly visibleRows: T[];

  /** The flag that indicates if all visible rows are selected. */
  readonly allVisibleRowsSelected: boolean;

  /** The flag that indicates if the table is currently loading data. */
  readonly loading: boolean;

  /** The length of the total number of items that are being paginated. Defaulted to 0. */
  readonly dataLength: number;

  /** The error that occured in the last observable returned by loadData or null. */
  error: any;

  /** The locale for the table texts. */
  locale: string;

  /** The name of the column, after which the rows should be sorted. Defaulted to asc. */
  sortColumn: string | null;

  /** The sort direction. Defaulted to asc. */
  sortDirection: 'asc' | 'desc';

  /** The zero-based page index of the displayed list of items. Defaulted to 0. */
  pageIndex: number;

  /** Number of items to display on a page. By default set to 15. */
  pageSize: number;

  /**
   * Filter term that should be used to filter out objects from the data array. To override how
   * data objects match to this filter string, provide a custom function for filterPredicate.
   */
  filter: string;

  /** Indicates if the table is ready. As long as this is false, any updateData calls can be ignored */
  tableReady: boolean;

  /** List of actions which can be executed for a single row */
  readonly rowActions: IZvTableAction<T>[];

  /** List of actions which can be executed for a selection of rows */
  readonly listActions: IZvTableAction<T>[];

  /** Component action init or changes callback of actions which can be executed for a selection of rows */
  readonly loadRowActionFn: (data: T, actions: IZvTableAction<T>[]) => Observable<IZvTableAction<T>[]>;

  /** Component open callbacks of actions which can be executed for a selection of rows */
  readonly openMenuRowActionFn: (data: T, actions: IZvTableAction<T>[]) => Observable<IZvTableAction<T>[]> | IZvTableAction<any>[] | null;

  readonly moreMenuThreshold: number;

  /**
   * Tracking function that will be used to check the differences in data changes.
   * Used similarly to ngFor trackBy function. Optimize row operations by identifying a row based
   * on its data relative to the function to know if a row should be added/removed/moved.
   * Accepts a function that takes two parameters, index and item.
   */
  trackBy: TrackByFunction<T>;

  /**
   * Returns the current page, sort and filter state
   */
  getUpdateDataInfo(): IZvTableUpdateDataInfo;

  /**
   * Reloads the data
   */
  updateData(forceReload: boolean): void;

  /**
   * Toggle the selection of the visible rows
   */
  toggleVisibleRowSelection(): void;

  /**
   * Used by the MatTable. Called when it connects to the data source.
   *
   * @docs-private
   */
  connect(): Observable<T[]>;

  /**
   * Used by the MatTable. Called when it is destroyed. No-op.
   *
   * @docs-private
   */
  disconnect(): void;
}
