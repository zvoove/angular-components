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
import { PsSelectItem } from '../models';
import { PsSelectDataSource } from '../select-data-source';

export declare type MaybeObservable<T> = T | Observable<T>;

export interface PsSelectDataSourceOptions<T = any> {
  mode: 'id' | 'entity';
  idKey: keyof T;
  labelKey: keyof T;
  items: MaybeObservable<T[]> | (() => MaybeObservable<T[]>);
  searchDebounce?: number;
  loadTrigger?: PsSelectLoadTrigger;
}

export function isPsSelectOptionsData(value: any): value is PsSelectDataSourceOptions {
  return typeof value === 'object' && 'idKey' in value && 'labelKey' in value && 'items' in value && 'mode' in value;
}

export const enum PsSelectLoadTrigger {
  // tslint:disable-next-line: no-bitwise
  Initial = 1 << 0,
  // tslint:disable-next-line: no-bitwise
  FirstPanelOpen = 1 << 1,
  // tslint:disable-next-line: no-bitwise
  EveryPanelOpen = 1 << 2,
  All = Initial + FirstPanelOpen + EveryPanelOpen,
}

export class DefaultPsSelectDataSource<T = any> extends PsSelectDataSource<T> {
  private _searchDebounceTime: number;
  private _loadTrigger: PsSelectLoadTrigger;
  private _isPanelOpen$ = new BehaviorSubject<boolean>(false);
  private _searchText$ = new BehaviorSubject<string>('');
  private _currentValues$ = new BehaviorSubject<T[]>([]);
  private _ngUnsubscribe$ = new Subject<string>();
  private _loadData: () => Observable<PsSelectItem<T>[]>;

  constructor(options: PsSelectDataSourceOptions) {
    super();

    this._searchDebounceTime = options.searchDebounce || 300;
    this._loadTrigger = options.loadTrigger || PsSelectLoadTrigger.Initial;

    let loadData: () => Observable<PsSelectItem<T>[]>;
    const entityToSelectItem = createEntityToSelectItemMapper(options.mode, options.idKey, options.labelKey);

    const items = options.items;
    if (typeof items !== 'function') {
      const data$ = ensureObservable(items).pipe(
        map(x => x.map(entityToSelectItem)),
        takeUntil(this._ngUnsubscribe$)
      );
      loadData = () => data$;
    } else {
      const func: () => T[] | Observable<T[]> = items as any;
      loadData = () => ensureObservable(func()).pipe(map(x => x.map(entityToSelectItem)));
    }

    if (options.mode === 'entity') {
      this.compareWith = createEntityComparer(options.idKey);
      this.getItemsForValues = (values: any[]) => {
        return values.map(entityToSelectItem);
      };
    }

    this._loadData = () => {
      this.loading = true;
      this.error = null;
      this.errorMessage = null;

      return loadData().pipe(
        catchError((err: Error | any) => {
          this.error = err;
          this.errorMessage = this.extractErrorMessage(err);
          return of([] as PsSelectItem<T>[]);
        }),
        tap(() => {
          this.loading = false;
        })
      );
    };
  }

  public connect(): Observable<PsSelectItem<T>[]> {
    const optionsLoadTrigger$ = this.createOptionsLoadTrigger();
    const loadedOptions$ = optionsLoadTrigger$.pipe(
      switchMap(() => this._loadData()),
      startWith<PsSelectItem<T>[]>([]),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    // Values die nicht in den Options sind, generieren wir hier
    const missingOptions$ = loadedOptions$.pipe(
      switchMap(options =>
        this._currentValues$.pipe(
          map(values => {
            const missingValues = values.filter(value => !options.find(o => this.compareWith(o.value, value)));
            const missingOptions = this.getItemsForValues(missingValues);
            return missingOptions;
          })
        )
      ),
      distinctUntilChanged((a, b) => {
        if (a.length !== b.length) {
          return false;
        }
        for (const option of a) {
          if (!b.find(o => this.compareWith(o.value, option.value))) {
            return false;
          }
        }
        return true;
      })
    );

    const options$ = combineLatest([loadedOptions$, missingOptions$]).pipe(
      map(([options, missingOptions]) =>
        missingOptions.concat(options).map(option => {
          if (!option.label) {
            option.label = '';
          } else if (!(typeof option.label === 'string')) {
            option.label = `${option.label}`;
          }
          return option;
        })
      )
    );

    const panelCloseEvent$ = this._isPanelOpen$.pipe(
      skip(1), // Wir wollen nur Close-Events, nicht den initialen Zustand des Panels
      distinctUntilChanged(),
      filter(x => !x)
    );
    const valueChangedWhileClosed$ = this._isPanelOpen$.pipe(
      distinctUntilChanged(),
      switchMap(panelOpen => (panelOpen ? NEVER : this._currentValues$.pipe(skip(1))))
    );
    const sortTrigger$ = merge(panelCloseEvent$, valueChangedWhileClosed$);
    const renderOptions$ = options$.pipe(
      // Initial und wenn sich das Panel schließt, müssen wir die selektierten Options nach oben sortieren
      switchMap(options =>
        sortTrigger$.pipe(
          startWith(!this._isPanelOpen$.value),
          map(() => {
            const selectedOptions = options.filter(option =>
              this._currentValues$.value.find(value => this.compareWith(option.value, value))
            );
            const selectedOptionsSet = new WeakSet(selectedOptions);
            options.sort((a, b) => {
              const aSelected = !!selectedOptionsSet.has(a);
              const bSelected = !!selectedOptionsSet.has(b);
              const selectedDifferent = +bSelected - +aSelected;
              if (selectedDifferent) {
                return selectedDifferent;
              }

              return this.sortCompare(a, b);
            });
            return options;
          })
        )
      ),
      // Suchtext handling
      switchMap(options =>
        this._searchText$.pipe(
          debounceTime(this._searchDebounceTime),
          startWith(this._searchText$.value),
          map(x => (x || '').toLowerCase()),
          distinctUntilChanged(),
          map(searchText => {
            options.forEach(option => {
              option.hidden = option.label.toLowerCase().indexOf(searchText) === -1;
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

  public getItemsForValues(values: T[]): PsSelectItem<T>[] {
    return values.map(v => ({
      value: v,
      label: `??? (ID: ${v})`,
    }));
  }

  /**
   * Sort comparer for the items.
   * Note: Selected items will still be at the top.
   */
  public sortCompare = (a: PsSelectItem, b: PsSelectItem): number => {
    return a.label.localeCompare(b.label);
  };

  /**
   * Extracts a error message from a given error object
   * @param error The error object.
   * @returns The error message
   */
  public extractErrorMessage = (error: any): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return error;
  };

  private createOptionsLoadTrigger(): Observable<void> {
    const loadTriggers: Observable<any>[] = [];
    // tslint:disable-next-line: no-bitwise
    if (this._loadTrigger & PsSelectLoadTrigger.Initial) {
      loadTriggers.push(of(null));
    }

    const panelOpen$ = this._isPanelOpen$.pipe(
      distinctUntilChanged(),
      filter(panelOpen => panelOpen)
    );
    // tslint:disable-next-line: no-bitwise
    if (this._loadTrigger & PsSelectLoadTrigger.EveryPanelOpen) {
      loadTriggers.push(panelOpen$);
      // tslint:disable-next-line: no-bitwise
    } else if (this._loadTrigger & PsSelectLoadTrigger.FirstPanelOpen) {
      loadTriggers.push(panelOpen$.pipe(take(1)));
    }

    return merge(...loadTriggers);
  }
}

export function ensureObservable<T>(data: T | Observable<T>): Observable<T> {
  if (!isObservable(data)) {
    data = of(data);
  }
  return data;
}

function createEntityToSelectItemMapper(mode: 'id' | 'entity', idKey: keyof any, labelKey: keyof any): (item: any) => PsSelectItem<any> {
  if (mode === 'id') {
    return (item: any) => ({
      value: item[idKey],
      label: item[labelKey],
      entity: item,
    });
  }
  return (item: any) => ({
    value: item,
    label: item[labelKey],
    entity: item,
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
