import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { delay, switchMap, tap } from 'rxjs/operators';
import { vi } from 'vitest';

import { ZvSelectItem } from '../models';
import { DefaultZvSelectDataSource, ZvSelectDataSourceOptions, ZvSelectLoadTrigger, ZvSelectSortBy } from './default-select-data-source';

describe('DefaultZvSelectDataSource', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it('should work with array data', async () => {
    const item = createItem('item', 1);
    const dataSource = new DefaultZvSelectDataSource(createDataSourceOptions([item]));

    let currentRenderOptions;
    dataSource.connect().subscribe((options) => {
      currentRenderOptions = options;
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.selectedValuesChanged([]);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.searchTextChanged('hallo');
    await vi.advanceTimersByTimeAsync(300);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]);

    dataSource.searchTextChanged('item');
    await vi.advanceTimersByTimeAsync(300);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.panelOpenChanged(true);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.disconnect();
  });

  it('should work with observable data', async () => {
    const item = createItem('item', 1);
    const dataSource = new DefaultZvSelectDataSource(createDataSourceOptions(of([item])));

    let currentRenderOptions;
    dataSource.connect().subscribe((options) => {
      currentRenderOptions = options;
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.selectedValuesChanged([]);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.searchTextChanged('hallo');
    await vi.advanceTimersByTimeAsync(300);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]);

    dataSource.searchTextChanged('item');
    await vi.advanceTimersByTimeAsync(300);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.panelOpenChanged(true);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.disconnect();
  });

  it('should subscribe only when connection to data, when it is an observable and no load trigger is configured', async () => {
    let loadDataCallCount = 0;
    const dataSource = new DefaultZvSelectDataSource(
      createDataSourceOptions(
        of([]).pipe(
          tap(() => {
            ++loadDataCallCount;
          })
        )
      )
    );

    dataSource.connect().subscribe();
    await vi.advanceTimersByTimeAsync(1);
    expect(loadDataCallCount).toBe(1);
    dataSource.selectedValuesChanged([]);
    dataSource.searchTextChanged('hallo');
    dataSource.panelOpenChanged(true);
    expect(loadDataCallCount).toBe(1);

    dataSource.disconnect();
  });

  it('should update loading flag', async () => {
    const dataSource = new DefaultZvSelectDataSource(
      createDataSourceOptions(() => of([]).pipe(delay(1000)), { loadTrigger: ZvSelectLoadTrigger.all })
    );
    expect(dataSource.loading).toBe(false);

    dataSource.connect().subscribe();
    await vi.advanceTimersByTimeAsync(1);
    expect(dataSource.loading).toBe(true);

    await vi.advanceTimersByTimeAsync(1001);
    expect(dataSource.loading).toBe(false);

    dataSource.searchTextChanged('hello');
    expect(dataSource.loading).toBe(false);
    await vi.advanceTimersByTimeAsync(150); // debounce time / 2
    expect(dataSource.loading).toBe(false);
    await vi.advanceTimersByTimeAsync(150); // debounce time / 2
    expect(dataSource.loading).toBe(false);

    dataSource.panelOpenChanged(true);
    expect(dataSource.loading).toBe(true);
    await vi.advanceTimersByTimeAsync(1001);
    expect(dataSource.loading).toBe(false);

    dataSource.panelOpenChanged(false);
    dataSource.panelOpenChanged(true);
    expect(dataSource.loading).toBe(true);
    await vi.advanceTimersByTimeAsync(1001);
    expect(dataSource.loading).toBe(false);

    dataSource.disconnect();
  });

  it('should filter for searchText and ignore casing', async () => {
    const halloWeltItem = createItem('Hallo Welt', 1);
    const halloItem = createItem('Hallo', 2);
    const weltItem = createItem('Welt', 3);
    const halloWeltOption = createIdOption(halloWeltItem);
    const halloOption = createIdOption(halloItem);
    const weltOption = createIdOption(weltItem);
    const halloWeltOptionHidden = createIdOption(halloWeltItem, true);
    const halloOptionHidden = createIdOption(halloItem, true);
    const weltOptionHidden = createIdOption(weltItem, true);
    const dataSource = new DefaultZvSelectDataSource(
      createDataSourceOptions(of([halloWeltItem, halloItem, weltItem]), { searchDebounce: 50 })
    );

    let currentRenderOptions;

    // Beim connecten darf das debounce das laden nicht verzögern
    dataSource.connect().subscribe((options) => {
      currentRenderOptions = options;
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([halloOption, halloWeltOption, weltOption]);

    // Testen, ob exakt übereinstimmender Text gefunden wird
    dataSource.searchTextChanged('Hallo Welt');
    await vi.advanceTimersByTimeAsync(50);
    expect(currentRenderOptions).toEqual([halloOptionHidden, halloWeltOption, weltOptionHidden]);

    // Testen, partieller Text mit anderem casing gefunden wird
    dataSource.searchTextChanged('eL');
    await vi.advanceTimersByTimeAsync(50);
    expect(currentRenderOptions).toEqual([halloOptionHidden, halloWeltOption, weltOption]);

    // Testen, ob es funktioniert, wenn nichts gefunden wird
    dataSource.searchTextChanged('asdf');
    await vi.advanceTimersByTimeAsync(50);
    expect(currentRenderOptions).toEqual([halloOptionHidden, halloWeltOptionHidden, weltOptionHidden]);

    dataSource.disconnect();
  });

  it('should debounce searchText', async () => {
    const item = createItem('item', 1);
    const dataSource = new DefaultZvSelectDataSource(createDataSourceOptions(of([item]), { searchDebounce: 50 }));

    let currentRenderOptions;

    // Beim connecten darf das debounce das laden nicht verzögern
    dataSource.connect().subscribe((options) => {
      currentRenderOptions = options;
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    // Testen, das die options wirklich erst nach der debounce time neu geladen werden
    dataSource.searchTextChanged('debounce search');
    await vi.advanceTimersByTimeAsync(49);
    expect(currentRenderOptions).toEqual([createIdOption(item)]); // debounce time noch nicht rum
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]); // debounce time erreicht

    // Testen, das das debounce bei mehreren eingaben functoniert
    dataSource.searchTextChanged('i');
    await vi.advanceTimersByTimeAsync(49);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]);
    dataSource.searchTextChanged('it');
    await vi.advanceTimersByTimeAsync(49);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]);
    dataSource.searchTextChanged('item');
    await vi.advanceTimersByTimeAsync(49);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]);
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.disconnect();
  });

  it('should not refresh options when searchText changes to the same value', async () => {
    const dataSource = new DefaultZvSelectDataSource(createDataSourceOptions(of([createItem('item', 1)]), { searchDebounce: 50 }));

    let optionsRefreshTime = 0;
    dataSource.connect().subscribe(() => {
      ++optionsRefreshTime;
    });
    await vi.advanceTimersByTimeAsync(1);

    // Search Text setzen, warten bis reloaded wurde und den call count resetten
    dataSource.searchTextChanged('text');
    await vi.advanceTimersByTimeAsync(50);
    optionsRefreshTime = 0;

    // Suchtext ändern und innerhalb der debounceTime zurück ändern
    dataSource.searchTextChanged('i');
    await vi.advanceTimersByTimeAsync(49);
    dataSource.searchTextChanged('text');
    await vi.advanceTimersByTimeAsync(50);
    expect(optionsRefreshTime).toEqual(0);

    dataSource.disconnect();
  });

  it('should by default only load options when connecting', async () => {
    let loadDataCallCount = 0;
    const dataSource = new DefaultZvSelectDataSource(
      createDataSourceOptions(() => {
        ++loadDataCallCount;
        return of([createItem('item', loadDataCallCount)]);
      })
    );

    let currentRenderOptions;
    dataSource.connect().subscribe((options) => {
      currentRenderOptions = options;
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createIdOption(createItem('item', 1))]);

    dataSource.selectedValuesChanged([]);
    dataSource.selectedValuesChanged([7]);
    dataSource.selectedValuesChanged([7, 13]);
    dataSource.panelOpenChanged(true);
    dataSource.panelOpenChanged(true);
    dataSource.searchTextChanged('item');
    await vi.advanceTimersByTimeAsync(300);
    dataSource.searchTextChanged('');
    await vi.advanceTimersByTimeAsync(300);

    expect(loadDataCallCount).toBe(1);

    dataSource.disconnect();
  });

  it('should only load options on first panel open if loadTrigger is FirstPanelOpen', async () => {
    let loadDataCallCount = 0;
    const dataSource = new DefaultZvSelectDataSource(
      createDataSourceOptions(
        () => {
          ++loadDataCallCount;
          return of([createItem('item', loadDataCallCount)]);
        },
        { loadTrigger: ZvSelectLoadTrigger.firstPanelOpen }
      )
    );

    dataSource.connect().subscribe();
    await vi.advanceTimersByTimeAsync(1);

    dataSource.selectedValuesChanged([]);
    dataSource.selectedValuesChanged([7]);
    dataSource.selectedValuesChanged([7, 13]);
    dataSource.searchTextChanged('item');
    await vi.advanceTimersByTimeAsync(300);
    dataSource.searchTextChanged('');
    await vi.advanceTimersByTimeAsync(300);

    expect(loadDataCallCount).toBe(0);

    dataSource.panelOpenChanged(true);
    expect(loadDataCallCount).toBe(1);

    dataSource.panelOpenChanged(true);
    expect(loadDataCallCount).toBe(1);

    dataSource.disconnect();
  });

  it('should load options on forced reload', async () => {
    let loadDataCallCount = 0;
    const dataSource = new DefaultZvSelectDataSource(
      createDataSourceOptions(() => {
        ++loadDataCallCount;
        return of([createItem('item', loadDataCallCount)]);
      })
    );

    let currentRenderOptions;
    dataSource.connect().subscribe((options) => {
      currentRenderOptions = options;
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(loadDataCallCount).toBe(1);
    expect(currentRenderOptions).toEqual([createIdOption(createItem('item', 1))]);

    dataSource.forceReload();
    expect(loadDataCallCount).toBe(2);

    dataSource.disconnect();
  });

  it('should load options on every panel open if loadTrigger is EveryPanelOpen', async () => {
    let loadDataCallCount = 0;
    const dataSource = new DefaultZvSelectDataSource(
      createDataSourceOptions(
        () => {
          ++loadDataCallCount;
          return of([createItem('item', loadDataCallCount)]);
        },
        { loadTrigger: ZvSelectLoadTrigger.everyPanelOpen }
      )
    );

    dataSource.connect().subscribe();
    await vi.advanceTimersByTimeAsync(1);

    dataSource.selectedValuesChanged([]);
    dataSource.selectedValuesChanged([7]);
    dataSource.selectedValuesChanged([7, 13]);
    dataSource.searchTextChanged('item');
    await vi.advanceTimersByTimeAsync(300);
    dataSource.searchTextChanged('');
    await vi.advanceTimersByTimeAsync(300);

    expect(loadDataCallCount).toBe(0);

    dataSource.panelOpenChanged(true);
    expect(loadDataCallCount).toBe(1);

    dataSource.panelOpenChanged(false);
    expect(loadDataCallCount).toBe(1);

    dataSource.panelOpenChanged(true);
    expect(loadDataCallCount).toBe(2);

    dataSource.panelOpenChanged(false);
    expect(loadDataCallCount).toBe(2);

    dataSource.panelOpenChanged(true);
    expect(loadDataCallCount).toBe(3);

    dataSource.disconnect();
  });

  it('should add selected values to loaded options, if they are missing', async () => {
    const items$ = new Subject<any[]>();
    const dataSource = new DefaultZvSelectDataSource<number>(createDataSourceOptions(() => items$));

    let currentRenderOptions: any[] | null = null;
    dataSource.connect().subscribe((options) => {
      currentRenderOptions = options;
    });
    await vi.advanceTimersByTimeAsync(1);

    // Selected Items sollten sofort gerendert werden, obwohl die options noch laden (items$ subject is noch leer)
    dataSource.selectedValuesChanged([1, 5]);
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createMissingOption(1), createMissingOption(5)]);

    const item = createItem('item', 1);
    const item2 = createItem('item 9', 9);
    const item3 = createItem('9', 11);

    items$.next([item]);
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createMissingOption(5), createIdOption(item)]);

    dataSource.selectedValuesChanged([7]);
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createMissingOption(7), createIdOption(item)]);

    dataSource.selectedValuesChanged([9, 10]);
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createMissingOption(10), createMissingOption(9), createIdOption(item)]);

    items$.next([item, item2]);
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createMissingOption(10), createIdOption(item2), createIdOption(item)]);

    // Sollte auch mit custom compareWith function gehen (value 9 und value 11 identisch)
    dataSource.compareWith = (a: unknown, b: unknown) => (a === 11 && b === 9) || (a === 9 && b === 11);

    items$.next([item, item3]);
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createIdOption(item3), createMissingOption(10), createIdOption(item)]);

    dataSource.disconnect();
    items$.complete();
  });

  it('should handle errors', async () => {
    let shouldThrow = true;
    const item = createItem('item', 1);
    const dataSource = new DefaultZvSelectDataSource(
      createDataSourceOptions(
        () => {
          let items$ = of([item]).pipe(delay(5));
          if (shouldThrow) {
            items$ = items$.pipe(switchMap(() => throwError(() => 'test error')));
          }
          return items$;
        },
        { loadTrigger: ZvSelectLoadTrigger.all }
      )
    );

    let currentRenderOptions: any[] | null = null;
    dataSource.connect().subscribe((options) => {
      currentRenderOptions = options;
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([]);
    expect(dataSource.error).toBeNull();

    await vi.advanceTimersByTimeAsync(5);
    expect(currentRenderOptions).toEqual([]);
    expect(dataSource.error).toBeDefined();

    dataSource.selectedValuesChanged([5]);
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createMissingOption(5)]);
    expect(dataSource.error).toBeDefined();

    shouldThrow = false;
    dataSource.panelOpenChanged(true);
    await vi.advanceTimersByTimeAsync(5);
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createMissingOption(5), createIdOption(item)]);
    expect(dataSource.error).toBeNull();

    dataSource.disconnect();
  });

  it('should sort selected options to the top after panel close', async () => {
    const item1 = createItem('item 1', 1);
    const item2 = createItem('item 2', 2);
    const item3 = createItem('item 3', 3);
    const dataSource = new DefaultZvSelectDataSource(createDataSourceOptions(() => of([item1, item2, item3])));

    let currentRenderOptions;
    dataSource.connect().subscribe((options) => {
      currentRenderOptions = options;
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createIdOption(item1), createIdOption(item2), createIdOption(item3)]);

    // Wenn Panel offen, nicht umsortieren
    dataSource.panelOpenChanged(true);
    dataSource.selectedValuesChanged([3]);
    expect(currentRenderOptions).toEqual([createIdOption(item1), createIdOption(item2), createIdOption(item3)]);

    // Beim Schließen dann umsortieren
    dataSource.panelOpenChanged(false);
    expect(currentRenderOptions).toEqual([createIdOption(item3), createIdOption(item1), createIdOption(item2)]);

    // Wenn geschlossen und value ändert sich, umsortieren
    dataSource.selectedValuesChanged([2, 3]);
    expect(currentRenderOptions).toEqual([createIdOption(item2), createIdOption(item3), createIdOption(item1)]);

    dataSource.disconnect();
  });

  it('should emit data only when needed', async () => {
    const items$ = new BehaviorSubject([createItem('item 1', 1)]);
    const dataSource = new DefaultZvSelectDataSource(createDataSourceOptions(() => items$, { loadTrigger: ZvSelectLoadTrigger.all }));

    let dataEmitCount = 0;
    dataSource.connect().subscribe(() => {
      ++dataEmitCount;
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(dataEmitCount).toBe(1);

    dataSource.panelOpenChanged(true);
    await vi.advanceTimersByTimeAsync(1);
    dataSource.panelOpenChanged(true);
    expect(dataEmitCount).toBe(2);

    dataSource.panelOpenChanged(false);
    await vi.advanceTimersByTimeAsync(1);
    dataSource.panelOpenChanged(false);
    expect(dataEmitCount).toBe(3);

    dataSource.panelOpenChanged(true);
    await vi.advanceTimersByTimeAsync(1);
    dataSource.panelOpenChanged(true);
    expect(dataEmitCount).toBe(4);

    dataSource.selectedValuesChanged(['item 1', 'x']);
    await vi.advanceTimersByTimeAsync(1);
    dataSource.selectedValuesChanged(['item 1', 'x']);
    expect(dataEmitCount).toBe(5);

    dataSource.searchTextChanged('te');
    dataSource.searchTextChanged('test');
    expect(dataEmitCount).toBe(5);
    await vi.advanceTimersByTimeAsync(300);
    expect(dataEmitCount).toBe(6);

    items$.next([createItem('item 1', 1), createItem('item 2', 2), createItem('item x', 'x')]);
    await vi.advanceTimersByTimeAsync(1);
    expect(dataEmitCount).toBe(7);

    dataSource.disconnect();
  });

  it('should set entity of SelectItem in mode id', async () => {
    const item = createItem('1', 1);
    const dataSource = new DefaultZvSelectDataSource(createDataSourceOptions([item]));
    let currentRenderOptions: ZvSelectItem[] = [];

    dataSource.connect().subscribe((options) => {
      currentRenderOptions = options;
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);
    const currentOption = currentRenderOptions[0];
    expect(currentOption.entity).toBe(item);

    dataSource.disconnect();
  });

  it('should set entity of SelectItem in mode entity', async () => {
    const item = createItem('1', 1);
    const dataSource = new DefaultZvSelectDataSource(createDataSourceOptions([item], { mode: 'entity' }));
    let currentRenderOptions: ZvSelectItem[] = [];

    dataSource.connect().subscribe((options) => {
      currentRenderOptions = options;
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(currentRenderOptions).toEqual([createEntityOption(item)]);
    const currentOption = currentRenderOptions[0];
    expect(currentOption.entity).toBe(item);

    dataSource.disconnect();
  });

  describe('should respect sort options', () => {
    let dataSource: DefaultZvSelectDataSource;
    const item1Label1 = createItem('1', 1);
    const item3Label2Selected = createItem('2', 2);
    const item4Label3 = createItem('3', 3);
    const item2Label4 = createItem('4', 4);
    const item6Label5Selected = createItem('5', 5);
    const item5Label6Selected = createItem('6', 6);
    const initialItems = [item1Label1, item2Label4, item3Label2Selected, item4Label3, item5Label6Selected, item6Label5Selected];
    let currentRenderOptions: ZvSelectItem<number>[];

    async function initDataSource(sort: ZvSelectSortBy, sortCompare?: (a: ZvSelectItem, b: ZvSelectItem) => number) {
      dataSource = new DefaultZvSelectDataSource(createDataSourceOptions(of(initialItems), { sortBy: sort }));
      if (sortCompare) {
        dataSource.sortCompare = sortCompare;
      }
      vi.spyOn(dataSource, 'sortCompare');
      dataSource.selectedValuesChanged([item3Label2Selected.value, item5Label6Selected.value, item6Label5Selected.value]);

      currentRenderOptions = null;
      dataSource.connect().subscribe((options) => {
        currentRenderOptions = options;
      });
      await vi.advanceTimersByTimeAsync(1);
    }

    it('null', async () => {
      await initDataSource(null);

      const expectedOptions = [item3Label2Selected, item6Label5Selected, item5Label6Selected, item1Label1, item4Label3, item2Label4].map(
        (x) => createIdOption(x)
      );
      expect(currentRenderOptions).toEqual(expectedOptions);
      expect(dataSource.sortCompare).toHaveBeenCalled();

      dataSource.disconnect();
    });

    it('ZvSelectSort.None', async () => {
      await initDataSource(ZvSelectSortBy.none);

      const expectedOptions = initialItems.map((x) => createIdOption(x));
      expect(currentRenderOptions).toEqual(expectedOptions);
      expect(dataSource.sortCompare).not.toHaveBeenCalled();

      dataSource.disconnect();
    });

    it('ZvSelectSort.Selected', async () => {
      await initDataSource(ZvSelectSortBy.selected);

      const expectedOptions = [item3Label2Selected, item5Label6Selected, item6Label5Selected, item1Label1, item2Label4, item4Label3].map(
        (x) => createIdOption(x)
      );
      expect(currentRenderOptions).toEqual(expectedOptions);
      expect(dataSource.sortCompare).not.toHaveBeenCalled();

      dataSource.disconnect();
    });

    it('ZvSelectSort.Comparer', async () => {
      await initDataSource(ZvSelectSortBy.comparer);

      const expectedOptions = [item1Label1, item3Label2Selected, item4Label3, item2Label4, item6Label5Selected, item5Label6Selected].map(
        (x) => createIdOption(x)
      );
      expect(currentRenderOptions).toEqual(expectedOptions);
      expect(dataSource.sortCompare).toHaveBeenCalled();

      dataSource.disconnect();
    });

    it('ZvSelectSort.Comparer with custom reverse sorting', async () => {
      await initDataSource(ZvSelectSortBy.comparer, (a, b) => (b.value as number) - (a.value as number)); // reverse sort

      const expectedOptions = [item5Label6Selected, item6Label5Selected, item2Label4, item4Label3, item3Label2Selected, item1Label1].map(
        (x) => createIdOption(x)
      );
      expect(currentRenderOptions).toEqual(expectedOptions);
      expect(dataSource.sortCompare).toHaveBeenCalled();

      dataSource.disconnect();
    });

    it('ZvSelectSort.Both', async () => {
      await initDataSource(ZvSelectSortBy.both);

      const expectedOptions = [item3Label2Selected, item6Label5Selected, item5Label6Selected, item1Label1, item4Label3, item2Label4].map(
        (x) => createIdOption(x)
      );
      expect(currentRenderOptions).toEqual(expectedOptions);
      expect(dataSource.sortCompare).toHaveBeenCalled();

      dataSource.disconnect();
    });

    it('ZvSelectSort.Both with custom reverse sorting', async () => {
      await initDataSource(ZvSelectSortBy.both, (a, b) => (b.value as number) - (a.value as number)); // reverse sort

      const expectedOptions = [item5Label6Selected, item6Label5Selected, item3Label2Selected, item2Label4, item4Label3, item1Label1].map(
        (x) => createIdOption(x)
      );
      expect(currentRenderOptions).toEqual(expectedOptions);
      expect(dataSource.sortCompare).toHaveBeenCalled();

      dataSource.disconnect();
    });
  });
});

interface Item {
  label: string;
  value: any;
}

export function createItem(label: string, value: any): Item {
  return {
    label: label,
    value: value,
  };
}

export function createMissingOption(id: number, hidden = false): ZvSelectItem {
  return {
    label: `??? (ID: ${id})`,
    hidden: hidden,
    value: id,
  };
}

export function createIdOption(item: Item, hidden = false, disabled = false): ZvSelectItem {
  return {
    label: item.label,
    value: item.value,
    hidden: hidden,
    entity: item,
    disabled: disabled,
  };
}

export function createEntityOption(item: Item, hidden = false, disabled = false): ZvSelectItem {
  return {
    label: item.label,
    value: item,
    hidden: hidden,
    entity: item,
    disabled: disabled,
  };
}

function createDataSourceOptions(items: any, optionOverrides: Partial<ZvSelectDataSourceOptions> = {}): ZvSelectDataSourceOptions {
  return Object.assign({ mode: 'id', idKey: 'value', labelKey: 'label', items: items }, optionOverrides);
}
