import { fakeAsync, tick } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { delay, switchMap, tap } from 'rxjs/operators';

import { PsSelectItem } from '../models';
import { DefaultPsSelectDataSource, PsSelectDataSourceOptions, PsSelectLoadTrigger } from './default-select-data-source';

describe('DefaultPsSelectDataSource', () => {
  it('should work with array data', fakeAsync(() => {
    const item = createItem('item', 1);
    const dataSource = new DefaultPsSelectDataSource(createDataSourceOptions([item]));

    let currentRenderOptions;
    dataSource.connect().subscribe(options => {
      currentRenderOptions = options;
    });
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.selectedValuesChanged([]);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.searchTextChanged('hallo');
    tick(300);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]);

    dataSource.searchTextChanged('item');
    tick(300);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.panelOpenChanged(true);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.disconnect();
  }));

  it('should work with observable data', fakeAsync(() => {
    const item = createItem('item', 1);
    const dataSource = new DefaultPsSelectDataSource(createDataSourceOptions(of([item])));

    let currentRenderOptions;
    dataSource.connect().subscribe(options => {
      currentRenderOptions = options;
    });
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.selectedValuesChanged([]);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.searchTextChanged('hallo');
    tick(300);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]);

    dataSource.searchTextChanged('item');
    tick(300);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.panelOpenChanged(true);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.disconnect();
  }));

  it('should subscribe only when connection to data, when it is an observable and no load trigger is configured', fakeAsync(() => {
    let loadDataCallCount = 0;
    const dataSource = new DefaultPsSelectDataSource(
      createDataSourceOptions(
        of([]).pipe(
          tap(() => {
            ++loadDataCallCount;
          })
        )
      )
    );

    dataSource.connect().subscribe();
    expect(loadDataCallCount).toBe(1);
    dataSource.selectedValuesChanged([]);
    dataSource.searchTextChanged('hallo');
    dataSource.panelOpenChanged(true);
    expect(loadDataCallCount).toBe(1);

    dataSource.disconnect();
  }));

  it('should update loading flag', fakeAsync(() => {
    const dataSource = new DefaultPsSelectDataSource(
      createDataSourceOptions(() => of([]).pipe(delay(1000)), { loadTrigger: PsSelectLoadTrigger.All })
    );
    expect(dataSource.loading).toBe(false);

    dataSource.connect().subscribe();
    expect(dataSource.loading).toBe(true);

    tick(1001);
    expect(dataSource.loading).toBe(false);

    dataSource.searchTextChanged('hello');
    expect(dataSource.loading).toBe(false);
    tick(150); // debounce time / 2
    expect(dataSource.loading).toBe(false);
    tick(150); // debounce time / 2
    expect(dataSource.loading).toBe(false);

    dataSource.panelOpenChanged(true);
    expect(dataSource.loading).toBe(true);
    tick(1001);
    expect(dataSource.loading).toBe(false);

    dataSource.panelOpenChanged(false);
    dataSource.panelOpenChanged(true);
    expect(dataSource.loading).toBe(true);
    tick(1001);
    expect(dataSource.loading).toBe(false);

    dataSource.disconnect();
  }));

  it('should filter for searchText and ignore casing', fakeAsync(() => {
    const halloWeltItem = createItem('Hallo Welt', 1);
    const halloItem = createItem('Hallo', 2);
    const weltItem = createItem('Welt', 3);
    const halloWeltOption = createIdOption(halloWeltItem);
    const halloOption = createIdOption(halloItem);
    const weltOption = createIdOption(weltItem);
    const halloWeltOptionHidden = createIdOption(halloWeltItem, true);
    const halloOptionHidden = createIdOption(halloItem, true);
    const weltOptionHidden = createIdOption(weltItem, true);
    const dataSource = new DefaultPsSelectDataSource(
      createDataSourceOptions(of([halloWeltItem, halloItem, weltItem]), { searchDebounce: 50 })
    );

    let currentRenderOptions;

    // Beim connecten darf das debounce das laden nicht verzögern
    dataSource.connect().subscribe(options => {
      currentRenderOptions = options;
    });
    expect(currentRenderOptions).toEqual([halloOption, halloWeltOption, weltOption]);

    // Testen, ob exakt übereinstimmender Text gefunden wird
    dataSource.searchTextChanged('Hallo Welt');
    tick(50);
    expect(currentRenderOptions).toEqual([halloOptionHidden, halloWeltOption, weltOptionHidden]);

    // Testen, partieller Text mit anderem casing gefunden wird
    dataSource.searchTextChanged('eL');
    tick(50);
    expect(currentRenderOptions).toEqual([halloOptionHidden, halloWeltOption, weltOption]);

    // Testen, ob es funktioniert, wenn nichts gefunden wird
    dataSource.searchTextChanged('asdf');
    tick(50);
    expect(currentRenderOptions).toEqual([halloOptionHidden, halloWeltOptionHidden, weltOptionHidden]);

    dataSource.disconnect();
  }));

  it('should debounce searchText', fakeAsync(() => {
    const item = createItem('item', 1);
    const dataSource = new DefaultPsSelectDataSource(createDataSourceOptions(of([item]), { searchDebounce: 50 }));

    let currentRenderOptions;

    // Beim connecten darf das debounce das laden nicht verzögern
    dataSource.connect().subscribe(options => {
      currentRenderOptions = options;
    });
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    // Testen, das die options wirklich erst nach der debounce time neu geladen werden
    dataSource.searchTextChanged('debounce search');
    tick(49);
    expect(currentRenderOptions).toEqual([createIdOption(item)]); // debounce time noch nicht rum
    tick(1);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]); // debounce time erreicht

    // Testen, das das debounce bei mehreren eingaben functoniert
    dataSource.searchTextChanged('i');
    tick(49);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]);
    dataSource.searchTextChanged('it');
    tick(49);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]);
    dataSource.searchTextChanged('item');
    tick(49);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]);
    tick(1);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.disconnect();
  }));

  it('should not refresh options when searchText changes to the same value', fakeAsync(() => {
    const dataSource = new DefaultPsSelectDataSource(createDataSourceOptions(of([createItem('item', 1)]), { searchDebounce: 50 }));

    let optionsRefreshTime = 0;
    dataSource.connect().subscribe(() => {
      ++optionsRefreshTime;
    });

    // Search Text setzen, warten bis reloaded wurde und den call count resetten
    dataSource.searchTextChanged('text');
    tick(50);
    optionsRefreshTime = 0;

    // Suchtext ändern und innerhalb der debounceTime zurück ändern
    dataSource.searchTextChanged('i');
    tick(49);
    dataSource.searchTextChanged('text');
    tick(50);
    expect(optionsRefreshTime).toEqual(0);

    dataSource.disconnect();
  }));

  it('should work with array data', fakeAsync(() => {
    const item = createItem('item', 1);
    const dataSource = new DefaultPsSelectDataSource(createDataSourceOptions([item]));

    let currentRenderOptions;
    dataSource.connect().subscribe(options => {
      currentRenderOptions = options;
    });
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.selectedValuesChanged([]);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.searchTextChanged('hallo');
    tick(300);
    expect(currentRenderOptions).toEqual([createIdOption(item, true)]);

    dataSource.searchTextChanged('item');
    tick(300);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.panelOpenChanged(true);
    expect(currentRenderOptions).toEqual([createIdOption(item)]);

    dataSource.disconnect();
  }));

  it('should by default only load options when connecting', fakeAsync(() => {
    let loadDataCallCount = 0;
    const dataSource = new DefaultPsSelectDataSource(
      createDataSourceOptions(() => {
        ++loadDataCallCount;
        return of([createItem('item', loadDataCallCount)]);
      })
    );

    let currentRenderOptions;
    dataSource.connect().subscribe(options => {
      currentRenderOptions = options;
    });
    expect(currentRenderOptions).toEqual([createIdOption(createItem('item', 1))]);

    dataSource.selectedValuesChanged([]);
    dataSource.selectedValuesChanged([7]);
    dataSource.selectedValuesChanged([7, 13]);
    dataSource.panelOpenChanged(true);
    dataSource.panelOpenChanged(true);
    dataSource.searchTextChanged('item');
    tick(300);
    dataSource.searchTextChanged('');
    tick(300);

    expect(loadDataCallCount).toBe(1);

    dataSource.disconnect();
  }));

  it('should only load options on first panel open if loadTrigger is FirstPanelOpen', fakeAsync(() => {
    let loadDataCallCount = 0;
    const dataSource = new DefaultPsSelectDataSource(
      createDataSourceOptions(
        () => {
          ++loadDataCallCount;
          return of([createItem('item', loadDataCallCount)]);
        },
        { loadTrigger: PsSelectLoadTrigger.FirstPanelOpen }
      )
    );

    dataSource.connect().subscribe();

    dataSource.selectedValuesChanged([]);
    dataSource.selectedValuesChanged([7]);
    dataSource.selectedValuesChanged([7, 13]);
    dataSource.searchTextChanged('item');
    tick(300);
    dataSource.searchTextChanged('');
    tick(300);

    expect(loadDataCallCount).toBe(0);

    dataSource.panelOpenChanged(true);
    expect(loadDataCallCount).toBe(1);

    dataSource.panelOpenChanged(true);
    expect(loadDataCallCount).toBe(1);

    dataSource.disconnect();
  }));

  it('should load options on every panel open if loadTrigger is EveryPanelOpen', fakeAsync(() => {
    let loadDataCallCount = 0;
    const dataSource = new DefaultPsSelectDataSource(
      createDataSourceOptions(
        () => {
          ++loadDataCallCount;
          return of([createItem('item', loadDataCallCount)]);
        },
        { loadTrigger: PsSelectLoadTrigger.EveryPanelOpen }
      )
    );

    dataSource.connect().subscribe();

    dataSource.selectedValuesChanged([]);
    dataSource.selectedValuesChanged([7]);
    dataSource.selectedValuesChanged([7, 13]);
    dataSource.searchTextChanged('item');
    tick(300);
    dataSource.searchTextChanged('');
    tick(300);

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
  }));

  it('should add selected values to loaded options, if they are missing', fakeAsync(() => {
    const items$ = new Subject<any[]>();
    const dataSource = new DefaultPsSelectDataSource<number>(
      createDataSourceOptions(() => {
        return items$;
      })
    );

    let currentRenderOptions: any[] | null = null;
    dataSource.connect().subscribe(options => {
      currentRenderOptions = options;
    });

    // Selected Items sollten sofort gerendert werden, obwohl die options noch laden (items$ subject is noch leer)
    dataSource.selectedValuesChanged([1, 5]);
    expect(currentRenderOptions).toEqual([createMissingOption(1), createMissingOption(5)]);

    const item = createItem('item', 1);
    const item2 = createItem('item 9', 9);
    const item3 = createItem('9', 11);

    items$.next([item]);
    expect(currentRenderOptions).toEqual([createMissingOption(5), createIdOption(item)]);

    dataSource.selectedValuesChanged([7]);
    expect(currentRenderOptions).toEqual([createMissingOption(7), createIdOption(item)]);

    dataSource.selectedValuesChanged([9, 10]);
    expect(currentRenderOptions).toEqual([createMissingOption(10), createMissingOption(9), createIdOption(item)]);

    items$.next([item, item2]);
    expect(currentRenderOptions).toEqual([createMissingOption(10), createIdOption(item2), createIdOption(item)]);

    // Sollte auch mit custom compareWith function gehen (value 9 und value 11 identisch)
    dataSource.compareWith = (a: number, b: number) => (a === 11 && b === 9) || (a === 9 && b === 11);

    items$.next([item, item3]);
    expect(currentRenderOptions).toEqual([createIdOption(item3), createMissingOption(10), createIdOption(item)]);

    dataSource.disconnect();
    items$.complete();
  }));

  it('should handle errors', fakeAsync(() => {
    let shouldThrow = true;
    const item = createItem('item', 1);
    const dataSource = new DefaultPsSelectDataSource(
      createDataSourceOptions(
        () => {
          let items$ = of([item]).pipe(delay(5));
          if (shouldThrow) {
            items$ = items$.pipe(switchMap(() => throwError('test error')));
          }
          return items$;
        },
        { loadTrigger: PsSelectLoadTrigger.All }
      )
    );

    let currentRenderOptions: any[] | null = null;
    dataSource.connect().subscribe(options => {
      currentRenderOptions = options;
    });
    expect(currentRenderOptions).toEqual([]);
    expect(dataSource.error).toBeNull();
    expect(dataSource.errorMessage).toBeNull();

    tick(5);
    expect(currentRenderOptions).toEqual([]);
    expect(dataSource.error).toBeDefined();
    expect(dataSource.errorMessage).toEqual('test error');

    dataSource.selectedValuesChanged([5]);
    expect(currentRenderOptions).toEqual([createMissingOption(5)]);
    expect(dataSource.error).toBeDefined();
    expect(dataSource.errorMessage).toEqual('test error');

    shouldThrow = false;
    dataSource.panelOpenChanged(true);
    tick(5);
    expect(currentRenderOptions).toEqual([createMissingOption(5), createIdOption(item)]);
    expect(dataSource.error).toBeNull();
    expect(dataSource.errorMessage).toBeNull();

    dataSource.disconnect();
  }));

  it('should sort selected options to the top after panel close', fakeAsync(() => {
    const item1 = createItem('item 1', 1);
    const item2 = createItem('item 2', 2);
    const item3 = createItem('item 3', 3);
    const dataSource = new DefaultPsSelectDataSource(
      createDataSourceOptions(() => {
        return of([item1, item2, item3]);
      })
    );

    let currentRenderOptions;
    dataSource.connect().subscribe(options => {
      currentRenderOptions = options;
    });
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
  }));

  it('should emit data only when needed', fakeAsync(() => {
    const dataSource = new DefaultPsSelectDataSource(
      createDataSourceOptions(
        () => {
          return of([createItem('item 1', 1)]);
        },
        { loadTrigger: PsSelectLoadTrigger.All }
      )
    );

    let dataEmitCount = 0;
    dataSource.connect().subscribe(() => {
      ++dataEmitCount;
    });
    expect(dataEmitCount).toBe(1);

    dataSource.panelOpenChanged(true);
    dataSource.panelOpenChanged(true);
    expect(dataEmitCount).toBe(2);

    dataSource.panelOpenChanged(false);
    dataSource.panelOpenChanged(false);
    expect(dataEmitCount).toBe(3);

    dataSource.panelOpenChanged(true);
    dataSource.panelOpenChanged(true);
    expect(dataEmitCount).toBe(4);

    dataSource.selectedValuesChanged(['item 1', 'x']);
    dataSource.selectedValuesChanged(['item 1', 'x']);
    expect(dataEmitCount).toBe(5);

    dataSource.searchTextChanged('te');
    dataSource.searchTextChanged('test');
    expect(dataEmitCount).toBe(5);
    tick(300);
    expect(dataEmitCount).toBe(6);

    dataSource.disconnect();
  }));

  it('should respect sortCompare', fakeAsync(() => {
    const item1 = createItem('1', 1);
    const item2 = createItem('2', 2);
    const item20 = createItem('20', 20);
    const item3 = createItem('3', 3);
    const dataSource = new DefaultPsSelectDataSource(createDataSourceOptions(of([item1, item20, item2, item3]), { searchDebounce: 50 }));
    dataSource.sortCompare = (a, b) => {
      return a.value - b.value;
    };
    let currentRenderOptions;

    // Beim connecten darf das debounce das laden nicht verzögern
    dataSource.connect().subscribe(options => {
      currentRenderOptions = options;
    });
    expect(currentRenderOptions).toEqual([createIdOption(item1), createIdOption(item2), createIdOption(item3), createIdOption(item20)]);

    dataSource.disconnect();
  }));

  it('should set entity of SelectItem in mode id', fakeAsync(() => {
    const item = createItem('1', 1);
    const dataSource = new DefaultPsSelectDataSource(createDataSourceOptions([item]));
    let currentRenderOptions: PsSelectItem[] = [];

    dataSource.connect().subscribe(options => {
      currentRenderOptions = options;
    });
    expect(currentRenderOptions).toEqual([createIdOption(item)]);
    const currentOption = currentRenderOptions[0];
    expect(currentOption.entity).toBe(item);

    dataSource.disconnect();
  }));

  it('should set entity of SelectItem in mode entity', fakeAsync(() => {
    const item = createItem('1', 1);
    const dataSource = new DefaultPsSelectDataSource(createDataSourceOptions([item], { mode: 'entity' }));
    let currentRenderOptions: PsSelectItem[] = [];

    dataSource.connect().subscribe(options => {
      currentRenderOptions = options;
    });
    expect(currentRenderOptions).toEqual([createEntityOption(item)]);
    const currentOption = currentRenderOptions[0];
    expect(currentOption.entity).toBe(item);

    dataSource.disconnect();
  }));
});

interface Item {
  label: string;
  value: any;
}

function createItem(label: string, value: any): Item {
  return {
    label: label,
    value: value,
  };
}

function createMissingOption(id: number, hidden = false): PsSelectItem {
  return {
    label: `??? (ID: ${id})`,
    hidden: hidden,
    value: id,
  };
}

function createIdOption(item: Item, hidden = false): PsSelectItem {
  return {
    label: item.label,
    value: item.value,
    hidden: hidden,
    entity: item,
  };
}

function createEntityOption(item: Item, hidden = false): PsSelectItem {
  return {
    label: item.label,
    value: item,
    hidden: hidden,
    entity: item,
  };
}

function createDataSourceOptions(items: any, optionOverrides: Partial<PsSelectDataSourceOptions> = {}): PsSelectDataSourceOptions {
  return Object.assign({ mode: 'id', idKey: 'value', labelKey: 'label', items: items }, optionOverrides);
}
