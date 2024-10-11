import { BehaviorSubject, combineLatest, isObservable, merge, NEVER, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { ZvSelectDataSource } from '../data/select-data-source';
import { ZvSelectItem } from '../models';

export declare type MaybeObservable<T> = T | Observable<T>;

export interface ZvSelectDataSourceOptions<T = any> {
  mode: 'id' | 'entity';
  idKey: keyof T;
  labelKey: keyof T;
  disabledKey?: keyof T;
  items: MaybeObservable<T[]> | (() => MaybeObservable<T[]>);
  searchDebounce?: number;
  loadTrigger?: ZvSelectLoadTrigger;
  sortBy?: ZvSelectSortBy;
}

export function isZvSelectOptionsData(value: any): value is ZvSelectDataSourceOptions {
  return typeof value === 'object' && 'idKey' in value && 'labelKey' in value && 'items' in value && 'mode' in value;
}

/**
 * At which point(s) to load the select data. Defaults to {@link ZvSelectLoadTrigger.initial}.
 */
export enum ZvSelectLoadTrigger {
  /**
   * Load values of select only once, on initial rendering of zv-select.
   */
  initial = 1 << 0,

  /**
   * Load values of select only once, when the user first clicks on it.
   */
  firstPanelOpen = 1 << 1,

  /**
   * Load values of select every time when the user first clicks on it.
   */
  everyPanelOpen = 1 << 2,

  /**
   * Load values on all of the above conditions.
   */
  all = initial + firstPanelOpen + everyPanelOpen,
}

export const enum ZvSelectSortBy {
  none = 0,
  selected = 1 << 0,
  comparer = 1 << 1,
  both = selected + comparer,
}

export class DefaultZvSelectDataSource<T = any> extends ZvSelectDataSource<T> {
  private _searchDebounceTime: number;
  private _loadTrigger: ZvSelectLoadTrigger;
  private _sortBy: ZvSelectSortBy;
  private _isPanelOpen$ = new BehaviorSubject<boolean>(false);
  private _searchText$ = new BehaviorSubject<string>('');
  private _currentValues$ = new BehaviorSubject<T[]>([]);
  private _ngUnsubscribe$ = new Subject<void>();
  private _loadData: () => Observable<ZvSelectItem<T>[]>;

  constructor(options: ZvSelectDataSourceOptions) {
    super();

    this._searchDebounceTime = options.searchDebounce ?? 300;
    this._loadTrigger = options.loadTrigger ?? ZvSelectLoadTrigger.initial;
    this._sortBy = options.sortBy ?? ZvSelectSortBy.both;

    let loadData: () => Observable<ZvSelectItem<T>[]>;
    const entityToSelectItem = createEntityToSelectItemMapper(options.mode, options.idKey, options.labelKey, options.disabledKey);

    const items = options.items;
    if (typeof items !== 'function') {
      const data$ = ensureObservable(items).pipe(
        map((x) => x.map(entityToSelectItem)),
        takeUntil(this._ngUnsubscribe$)
      );
      loadData = () => data$;
    } else {
      const func: () => T[] | Observable<T[]> = items as any;
      loadData = () => ensureObservable(func()).pipe(map((x) => x.map(entityToSelectItem)));
    }

    if (options.mode === 'entity') {
      this.compareWith = createEntityComparer(options.idKey);
      this.getItemsForValues = (values: any[]) => values.map(entityToSelectItem);
    }

    this._loadData = () => {
      this.loading = true;
      this.error = null;

      return loadData().pipe(
        catchError((err: Error | any) => {
          this.error = err;
          return of([] as ZvSelectItem<T>[]);
        }),
        tap(() => {
          this.loading = false;
        })
      );
    };
  }

  public connect(): Observable<ZvSelectItem<T>[]> {
    const optionsLoadTrigger$ = this._createOptionsLoadTrigger();
    const loadedOptions$ = optionsLoadTrigger$.pipe(
      switchMap(() => this._loadData()),
      startWith<ZvSelectItem<T>[]>([]),
      map((options) => options.map(normalizeLabel)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    // generate values as options, that aren't in the loaded options
    const missingOptions$ = loadedOptions$.pipe(
      switchMap((options) =>
        this._currentValues$.pipe(map((values) => values.filter((value) => !options.find((o) => this.compareWith(o.value, value)))))
      ),
      distinctUntilChanged((a, b) => {
        if (a.length !== b.length) {
          return false;
        }
        for (const value of a) {
          if (!b.find((o) => this.compareWith(o, value))) {
            return false;
          }
        }
        return true;
      }),
      map((missingValues) => this.getItemsForValues(missingValues).map(normalizeLabel))
    );

    let renderOptions$ = combineLatest([loadedOptions$, missingOptions$]).pipe(
      debounceTime(0),
      map(([options, missingOptions]) => missingOptions.concat(options))
    );

    if (this._sortBy) {
      const sortTrigger$ = this._createSortTrigger();
      renderOptions$ = renderOptions$.pipe(
        switchMap((unsortedOptions) => sortTrigger$.pipe(map(() => this._cloneAndSort(unsortedOptions))))
      );
    }

    // searchtext handling
    renderOptions$ = renderOptions$.pipe(
      switchMap((options) =>
        this._searchText$.pipe(
          debounceTime(this._searchDebounceTime),
          startWith(this._searchText$.value),
          map((x) => (x || '').toLowerCase()),
          distinctUntilChanged(),
          map((searchText) => {
            options.forEach((option) => {
              option.hidden = this.searchCompare(option, searchText);
            });
            return options;
          })
        )
      )
    );
    return renderOptions$;
  }

  public disconnect(): void {
    this._isPanelOpen$.complete();
    this._searchText$.complete();
    this._currentValues$.complete();
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }

  public panelOpenChanged(panelOpen: boolean): void {
    this._isPanelOpen$.next(panelOpen);
  }

  public searchTextChanged(searchText: string): void {
    this._searchText$.next(searchText);
  }

  public selectedValuesChanged(values: T[]): void {
    this._currentValues$.next(values);
  }

  public getItemsForValues(values: T[]): ZvSelectItem<T>[] {
    return values.map((v) => ({
      value: v,
      label: `??? (ID: ${v})`,
    }));
  }

  /**
   * Sort comparer for the items.
   * Note: Selected items will still be at the top.
   */
  public sortCompare = (a: ZvSelectItem, b: ZvSelectItem): number => a.label.localeCompare(b.label);

  /**
   * Search comparer for the items.
   */
  public searchCompare = (option: ZvSelectItem, searchText: string): boolean => option.label.toLowerCase().indexOf(searchText) === -1;

  private _createOptionsLoadTrigger(): Observable<void> {
    const loadTriggers: Observable<any>[] = [];

    if (this._loadTrigger & ZvSelectLoadTrigger.initial) {
      loadTriggers.push(of(null));
    }

    const panelOpen$ = this._isPanelOpen$.pipe(
      distinctUntilChanged(),
      filter((panelOpen) => panelOpen)
    );

    if (this._loadTrigger & ZvSelectLoadTrigger.everyPanelOpen) {
      loadTriggers.push(panelOpen$);
    } else if (this._loadTrigger & ZvSelectLoadTrigger.firstPanelOpen) {
      loadTriggers.push(panelOpen$.pipe(take(1)));
    }

    return merge(...loadTriggers);
  }

  private _createSortTrigger(): Observable<unknown> {
    const panelCloseEvent$ = this._isPanelOpen$.pipe(
      skip(1), // we don't need the initial value
      distinctUntilChanged(),
      filter((x) => !x) // we only care about close-events
    );
    const valueChangedWhileClosed$ = this._isPanelOpen$.pipe(
      distinctUntilChanged(),
      switchMap((panelOpen) => (panelOpen ? NEVER : this._currentValues$.pipe(skip(1))))
    );

    // initially and on panel close we must sort the selected options to the top
    return merge(panelCloseEvent$, valueChangedWhileClosed$).pipe(startWith(0));
  }

  private _cloneAndSort(unsortedOptions: ZvSelectItem<T>[]) {
    let selectedOptionsSet: WeakSet<ZvSelectItem> = null;

    if (this._sortBy & ZvSelectSortBy.selected) {
      const selectedOptions = unsortedOptions.filter((option) =>
        this._currentValues$.value.find((value) => this.compareWith(option.value, value))
      );
      selectedOptionsSet = new WeakSet(selectedOptions);
    }
    const sortedOptions = unsortedOptions.slice().sort((a, b) => {
      if (this._sortBy & ZvSelectSortBy.selected) {
        const aSelected = +selectedOptionsSet.has(a);
        const bSelected = +selectedOptionsSet.has(b);
        const selectedDifferent = bSelected - aSelected;
        if (selectedDifferent) {
          return selectedDifferent;
        }
      }

      return this._sortBy & ZvSelectSortBy.comparer ? this.sortCompare(a, b) : 0;
    });
    return sortedOptions;
  }
}

export function ensureObservable<T>(data: T | Observable<T>): Observable<T> {
  if (!isObservable(data)) {
    data = of(data);
  }
  return data;
}

function createEntityToSelectItemMapper(
  mode: 'id' | 'entity',
  idKey: keyof any,
  labelKey: keyof any,
  disabledKey: keyof any
): (item: any) => ZvSelectItem<any> {
  if (mode === 'id') {
    return (item: any) => ({
      value: item[idKey],
      label: item[labelKey],
      entity: item,
      disabled: (disabledKey && item[disabledKey]) || false,
    });
  }
  return (item: any) => ({
    value: item,
    label: item[labelKey],
    entity: item,
    disabled: (disabledKey && item[disabledKey]) || false,
  });
}

function createEntityComparer(idKey: keyof any) {
  return (entity1: any, entity2: any) => {
    // Wenn sie gleich sind, sind sie wohl gleich :D
    if (entity1 === entity2) {
      return true;
    }

    // Wenn der typ ungleich ist, dann sind sie nicht gleich
    if (typeof entity1 !== typeof entity2) {
      return false;
    }

    // Wenn eins von beidem falsy ist, es aber nicht das gleiche falsy ist (check oben), dann sind sie nicht gleich
    if (!entity1 || !entity2) {
      return false;
    }

    // Wenn es kein Object ist, wird es nicht unterstützt und wir geben false zurück
    if (typeof entity1 !== 'object') {
      return false;
    }

    return entity1[idKey] === entity2[idKey];
  };
}

function normalizeLabel(option: ZvSelectItem) {
  if (!option.label) {
    option.label = '';
  } else if (!(typeof option.label === 'string')) {
    option.label = `${option.label}`;
  }
  return option;
}
