/* eslint-disable @typescript-eslint/naming-convention */
import { fakeAsync, tick } from '@angular/core/testing';
import { NEVER, of, Subject, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { ZvTableDataSource, ZvTableDataSourceOptions, IExtendedZvTableUpdateDataInfo } from '../data/table-data-source';

describe('ZvTableDataSource', () => {
  it('should have sensible default values', fakeAsync(() => {
    const loadedData = [{ prop: 'x' }];
    const dataSource = new ZvTableDataSource<any>(() => of(loadedData).pipe(delay(500)));
    dataSource.tableReady = true;

    expect(dataSource.loading).toBe(true);
    expect(dataSource.data).toEqual([]);
    expect(dataSource.locale).toBeFalsy();
    expect(dataSource.mode).toEqual('client');
    expect(dataSource.pageIndex).toEqual(0);
    expect(dataSource.pageSize).toEqual(15);
    expect(dataSource.sortColumn).toEqual(null);
    expect(dataSource.sortDirection).toEqual('asc');
    expect(dataSource.filter).toEqual('');
    expect(dataSource.visibleRows).toEqual([]);
    expect(dataSource.dataLength).toEqual(0);
    expect(dataSource.selectionModel.isMultipleSelection()).toEqual(true);
    expect(dataSource.selectionModel.selected).toEqual([]);
  }));

  it('should return empty array on connect, even if data is not loaded yet', fakeAsync(() => {
    const dataSource = new ZvTableDataSource<any>(() => <any>NEVER);
    dataSource.tableReady = true;

    const renderDataUpdates: any[] = [];
    const sub = dataSource.connect().subscribe((data) => {
      renderDataUpdates.push(data);
    });
    expect(renderDataUpdates.length).toBe(1);
    expect(renderDataUpdates.pop()).toEqual([]);

    dataSource.disconnect();
    sub.unsubscribe();
  }));

  it('should not start loading data on connect (the table has to triggers this)', fakeAsync(() => {
    const dataSource = new ZvTableDataSource<any>(() => <any>NEVER);
    dataSource.tableReady = true;

    spyOn(dataSource, 'updateData');
    const sub = dataSource.connect().subscribe();
    dataSource.disconnect();
    sub.unsubscribe();

    expect(dataSource.updateData).not.toHaveBeenCalled();
  }));

  it('should not load data until the table is ready', fakeAsync(() => {
    let dataLoadCalled = false;
    const dataSource = new ZvTableDataSource<any>(() => {
      dataLoadCalled = true;
      return <any>NEVER;
    });

    const sub = dataSource.connect().subscribe();
    dataSource.updateData(false);
    dataSource.updateData(true);
    dataSource.disconnect();
    sub.unsubscribe();

    expect(dataLoadCalled).toBeFalsy();

    dataSource.tableReady = true;
    dataSource.updateData(false);

    expect(dataLoadCalled).toBeTruthy();
  }));

  it('should work with minimal options object and set default values', fakeAsync(() => {
    const options: ZvTableDataSourceOptions<any> = {
      loadDataFn: () => of([]),
    };
    spyOn(options, 'loadDataFn').and.callThrough();

    const dataSource = new ZvTableDataSource<any>(options);
    dataSource.tableReady = true;
    expect(dataSource.mode).toEqual('client');

    const sub = dataSource.connect().subscribe();
    expect(options.loadDataFn).not.toHaveBeenCalled();

    dataSource.updateData(true);

    dataSource.disconnect();
    sub.unsubscribe();

    expect(options.loadDataFn).toHaveBeenCalledTimes(1);
  }));

  it('should work with complete options object', fakeAsync(() => {
    const trigger$ = new Subject<void>();
    const options: ZvTableDataSourceOptions<any> = {
      loadTrigger$: trigger$,
      loadDataFn: () => of([]),
      mode: 'server',
    };
    spyOn(options, 'loadDataFn').and.callThrough();

    const dataSource = new ZvTableDataSource<any>(options);
    dataSource.tableReady = true;
    expect(dataSource.mode).toEqual('server');

    // trigger before connect shouldn't do anything
    trigger$.next();
    const sub = dataSource.connect().subscribe();
    expect(options.loadDataFn).not.toHaveBeenCalled();

    // trigger while connected should call the load function
    trigger$.next();
    dataSource.disconnect();
    sub.unsubscribe();

    expect(options.loadDataFn).toHaveBeenCalledTimes(1);
  }));

  it('should reset error/loading/data/selection before updateData and after', fakeAsync(() => {
    let doThrowError: Error = null;
    let beforeVisibleRows: any[] = [];
    const beforeDataItem = {};
    const loadedData = [{ prop: 'x' }, { prop: 'y' }];
    const dataSource = new ZvTableDataSource<any>(() => {
      let result = of(loadedData).pipe(delay(500));
      if (doThrowError) {
        result = result.pipe(
          map(() => {
            throw doThrowError;
          })
        );
      }
      return result;
    });
    dataSource.tableReady = true;

    let renderDataUpdates: any[] = [];
    dataSource.connect().subscribe((data) => {
      renderDataUpdates.push(data);
    });

    // first load should load data from the server
    doThrowError = new Error('oh no');
    initDirtyState([beforeDataItem]);
    dataSource.updateData(false);
    expectAsyncLoadingState();
    tick(500);
    expectErrorState();

    // as long as no data is successfullyloaded, it should load data from the server
    doThrowError = null;
    initDirtyState([beforeDataItem]);
    dataSource.updateData(false);
    expectAsyncLoadingState();
    tick(500);
    expectLoadedState(loadedData, loadedData.length, loadedData);

    // when data is already loaded, just update the visible items and clear the selection model
    {
      const error = new Error();
      dataSource.loading = false;
      dataSource.error = error;
      dataSource.data = loadedData;
      dataSource.dataLength = loadedData.length;

      dataSource.selectionModel.select(loadedData[0]);
      renderDataUpdates = [];

      dataSource.filter = 'x';
      dataSource.updateData(false);

      // check, that loading, error and data are unchanged
      expect(dataSource.loading).toBe(false);
      expect(dataSource.error).toBe(error);
      expect(dataSource.data).toBe(loadedData);
      expect(dataSource.dataLength).toBe(1);

      // check for the neccessary changes
      const visibleRows = loadedData.filter((x) => x.prop === 'x');
      expect(dataSource.visibleRows).toEqual(visibleRows);
      expect(dataSource.selectionModel.selected).toEqual([]);
      expect(renderDataUpdates.length).toEqual(1);
      expect(renderDataUpdates.pop()).toEqual(visibleRows);

      dataSource.filter = '';
    }

    // when data is already loaded AND another update request is in flight, don't do anything
    {
      const error = new Error();
      dataSource.loading = true;
      dataSource.error = error;
      dataSource.data = loadedData;
      dataSource.dataLength = loadedData.length;

      dataSource.selectionModel.select(loadedData[0]);
      renderDataUpdates = [];

      dataSource.filter = 'x';
      dataSource.updateData(false);

      // check, that loading, error and data are unchanged
      expect(dataSource.loading).toBe(true);
      expect(dataSource.error).toBe(error);
      expect(dataSource.data).toBe(loadedData);
      expect(dataSource.dataLength).toBe(loadedData.length);
      expect(dataSource.visibleRows).toEqual(loadedData);
      expect(dataSource.selectionModel.selected).toEqual([loadedData[0]]);
      expect(renderDataUpdates.length).toEqual(0);

      dataSource.filter = '';
    }

    // with force reload, it should load data from the server
    initDirtyState([beforeDataItem]);
    dataSource.updateData(true);
    expectAsyncLoadingState();
    tick(500);
    expectLoadedState(loadedData, loadedData.length, loadedData);

    function initDirtyState(data: any[]) {
      dataSource.loading = false;
      dataSource.error = new Error();
      dataSource.data = data;
      dataSource.dataLength = data.length;
      dataSource.selectionModel.select(data[0]);
      renderDataUpdates = [];
      beforeVisibleRows = dataSource.visibleRows;
    }

    function expectAsyncLoadingState() {
      // state should be resetted
      expect(dataSource.loading).toBe(true);
      expect(dataSource.error).toBe(null);
      expect(dataSource.selectionModel.selected).toEqual([]);
      expect(renderDataUpdates.length).toEqual(0);

      // data shouldn't have changed, otherwise pagination breaks
      expect(dataSource.data).toEqual([beforeDataItem]);
      expect(dataSource.dataLength).toEqual(1);

      // but visible rows should be unmodified, so the table doesn't have to trash and rebuild the dom while loading
      expect(dataSource.visibleRows).toEqual(beforeVisibleRows);
    }

    function expectLoadedState(data: any[], dataLength: number, visibleData: any[]) {
      expect(dataSource.loading).toBe(false);
      expect(dataSource.error).toBe(null);
      expect(dataSource.data).toEqual(data);
      expect(dataSource.dataLength).toEqual(dataLength);
      expect(dataSource.visibleRows).toEqual(visibleData);
      expect(dataSource.selectionModel.selected).toEqual([]);
      expect(renderDataUpdates.length).toEqual(1);
      expect(renderDataUpdates.pop()).toEqual(visibleData);
    }

    function expectErrorState() {
      expect(dataSource.loading).toBe(false);
      expect(dataSource.error).toBe(doThrowError);
      expect(dataSource.data).toEqual([]);
      expect(dataSource.dataLength).toEqual(0);
      expect(dataSource.visibleRows).toEqual([]);
      expect(dataSource.selectionModel.selected).toEqual([]);
      expect(renderDataUpdates.length).toEqual(1);
      expect(renderDataUpdates.pop()).toEqual([]);
    }
  }));

  it('should not sort/filter/page, but provide info to loadData when mode is server', () => {
    const loadedData = Array.from(new Array(20).keys()).map((x) => ({ prop: x }));
    let lastUpdateInfo: IExtendedZvTableUpdateDataInfo<any> = null;
    const dataSource = new ZvTableDataSource<any>((updateInfo) => {
      lastUpdateInfo = updateInfo;
      return of(loadedData);
    }, 'server');
    dataSource.tableReady = true;

    spyOn(dataSource, 'filterProperties');
    spyOn(dataSource, 'filterValues');
    spyOn(dataSource, 'filterPredicate');
    spyOn(dataSource, 'sortingDataAccessor');
    spyOn(dataSource, 'sortData');

    let renderData: any[] = [];
    const sub = dataSource.connect().subscribe((data) => {
      renderData = data;
    });

    dataSource.pageSize = 2;
    dataSource.pageIndex = 3;
    dataSource.filter = 'a';
    dataSource.sortColumn = 'prop';
    dataSource.sortDirection = 'desc';
    dataSource.updateData(false);

    expect(lastUpdateInfo).toEqual({
      pageSize: 2,
      currentPage: 3,
      searchText: 'a',
      sortColumn: 'prop',
      sortDirection: 'desc',
      triggerData: null,
    });
    expect(renderData).toBe(loadedData);

    expect(dataSource.filterProperties).not.toHaveBeenCalled();
    expect(dataSource.filterValues).not.toHaveBeenCalled();
    expect(dataSource.filterPredicate).not.toHaveBeenCalled();
    expect(dataSource.sortingDataAccessor).not.toHaveBeenCalled();
    expect(dataSource.sortData).not.toHaveBeenCalled();

    sub.unsubscribe();
  });

  it('should call sortData with the right parameters when mode is client', fakeAsync(() => {
    const loadedData = [{ prop: 'a' }];
    const dataSource = new ZvTableDataSource<any>(() => of(loadedData), 'client');
    dataSource.tableReady = true;

    spyOn(dataSource, 'sortData').and.returnValue([{ x: 'sorted' }]);

    let renderData: any[] = [];
    const sub = dataSource.connect().subscribe((data) => {
      renderData = data;
    });

    dataSource.sortColumn = 'prop';
    dataSource.sortDirection = 'asc';
    dataSource.updateData();

    expect(dataSource.sortData).toHaveBeenCalledWith([{ prop: 'a' }], { sortColumn: 'prop', sortDirection: 'asc' });
    expect(renderData).toEqual([{ x: 'sorted' }]);

    dataSource.sortColumn = 'prop_d';
    dataSource.sortDirection = 'desc';
    dataSource.updateData();

    expect(dataSource.sortData).toHaveBeenCalledWith([{ prop: 'a' }], { sortColumn: 'prop_d', sortDirection: 'desc' });
    expect(renderData).toEqual([{ x: 'sorted' }]);

    sub.unsubscribe();
  }));

  it('should use cached data if loading is not neccessary in client mode', fakeAsync(() => {
    let counter = 0;
    let throwErr = false;
    const dataProvider = {
      loadData: () => (throwErr ? throwError(() => new Error('error')) : of([{ a: ++counter }])),
    };
    const clientDataSource = new ZvTableDataSource<any>(() => dataProvider.loadData(), 'client');
    clientDataSource.tableReady = true;

    let renderData: any[] = [];
    const sub = clientDataSource.connect().subscribe((data) => {
      renderData = data;
    });

    clientDataSource.updateData(false);
    expect(renderData).toEqual([{ a: 1 }]);

    clientDataSource.updateData(false);
    expect(renderData).toEqual([{ a: 1 }]);

    clientDataSource.updateData(true);
    expect(renderData).toEqual([{ a: 2 }]);

    throwErr = true;
    clientDataSource.updateData(false);
    expect(renderData).toEqual([{ a: 2 }]);

    clientDataSource.updateData(true);
    expect(renderData).toEqual([]);

    throwErr = false;
    clientDataSource.updateData(false);
    expect(renderData).toEqual([{ a: 3 }]);

    sub.unsubscribe();
  }));

  it('should never cache data for server mode', fakeAsync(() => {
    let counter = 0;
    const dataProvider = {
      loadData: () => of([{ a: ++counter }]),
    };
    spyOn(dataProvider, 'loadData').and.callThrough();

    const serverDataSource = new ZvTableDataSource<any>(() => dataProvider.loadData(), 'server');
    serverDataSource.tableReady = true;
    serverDataSource.updateData(false);
    serverDataSource.updateData(false);
    serverDataSource.updateData(true);
    serverDataSource.updateData(false);
    expect(dataProvider.loadData).toHaveBeenCalledTimes(4);
  }));

  describe('sortingDataAccessor', () => {
    it('should return the requested property value', () => {
      const dataSource = new ZvTableDataSource<any>(() => of([]), 'client');
      dataSource.tableReady = true;
      expect(dataSource.sortingDataAccessor({ prop: 5 }, 'prop')).toBe(5);
      expect(dataSource.sortingDataAccessor({ prop: 'a' }, 'prop')).toBe('a');
      const nestedObj = {};
      expect(dataSource.sortingDataAccessor({ prop: nestedObj }, 'prop')).toBe(nestedObj);
      expect(dataSource.sortingDataAccessor({ prop: nestedObj }, 'a')).toBe(undefined);
    });
  });
  describe('sortData', () => {
    function sortAssert<T>(inData: T[], ascExpectedData: T[], descExpectedData: T[]) {
      const dataSource = new ZvTableDataSource<any>(() => of([]), 'client');
      dataSource.tableReady = true;

      const data = inData.map((x) => ({ prop: x }));
      const sortedDataAsc = dataSource.sortData(data, { sortColumn: 'prop', sortDirection: 'asc' });
      expect(sortedDataAsc).toEqual(ascExpectedData.map((x) => ({ prop: x })));

      const sortedDataDesc = dataSource.sortData(data, { sortColumn: 'prop', sortDirection: 'desc' });
      expect(sortedDataDesc).toEqual(descExpectedData.map((x) => ({ prop: x })));
    }
    it('should sort strings', () => {
      sortAssert(['b', 'a', 'c'], ['a', 'b', 'c'], ['c', 'b', 'a']);
    });
    it('should sort numbers', () => {
      sortAssert([2, 1, 3], [1, 2, 3], [3, 2, 1]);
    });
    it('should sort string numbers', () => {
      sortAssert(['2', '10', '3'], ['2', '3', '10'], ['10', '3', '2']);
    });
    it('should sort booleans', () => {
      sortAssert([true, false, true], [false, true, true], [true, true, false]);
    });
    it('should sort dates', () => {
      const now = new Date();
      const future = new Date();
      future.setMinutes(70);
      const past = new Date();
      past.setMinutes(-70);
      sortAssert([now, future, past], [past, now, future], [future, now, past]);
    });
    it('should use sortingDataAccessor to get the sort property', () => {
      const dataSource = new ZvTableDataSource<any>(() => of([]), 'client');
      dataSource.tableReady = true;
      spyOn(dataSource, 'sortingDataAccessor').and.callThrough();

      const data = [{ prop: 'b' }, { prop: 'a' }];
      dataSource.sortData(data, { sortColumn: 'prop', sortDirection: 'asc' });
      expect(dataSource.sortingDataAccessor).toHaveBeenCalledWith({ prop: 'b' }, 'prop');
      expect(dataSource.sortingDataAccessor).toHaveBeenCalledWith({ prop: 'a' }, 'prop');
    });
  });

  it('should call filterPredicate with the right parameters when mode is client', fakeAsync(() => {
    const loadedData = [{ prop: 'a' }];
    const dataSource = new ZvTableDataSource<any>(() => of(loadedData), 'client');
    dataSource.tableReady = true;

    spyOn(dataSource, 'filterPredicate').and.callThrough();

    let renderData: any[] = [];
    const sub = dataSource.connect().subscribe((data) => {
      renderData = data;
    });

    dataSource.filter = 'b';
    dataSource.updateData();

    expect(dataSource.filterPredicate).toHaveBeenCalledWith({ prop: 'a' }, 'b');
    expect(renderData).toEqual([]);

    dataSource.filter = 'a';
    dataSource.updateData();

    expect(dataSource.filterPredicate).toHaveBeenCalledWith({ prop: 'a' }, 'a');
    expect(renderData).toEqual([{ prop: 'a' }]);

    sub.unsubscribe();
  }));

  describe('filterProperties', () => {
    it('should return all object keys, but no nested keys', () => {
      const dataSource = new ZvTableDataSource<any>(() => of([]), 'client');
      dataSource.tableReady = true;

      expect(dataSource.filterProperties({ a: 5, b: { b_a: 3 }, 'c c': 4 })).toEqual(['a', 'b', 'c c']);
    });
  });

  describe('filterValues', () => {
    it('should call filterProperties and return the values of the given properties', () => {
      const dataSource = new ZvTableDataSource<any>(() => of([]), 'client');
      dataSource.tableReady = true;
      spyOn(dataSource, 'filterProperties').and.returnValue(['a', 'c c']);

      const obj = { a: 1, b: { b_a: 2 }, 'c c': 3, invisible: 5 };
      expect(dataSource.filterValues(obj)).toEqual([1, 3]);
      expect(dataSource.filterProperties).toHaveBeenCalledWith(obj);
    });
  });

  describe('filterPredicate', () => {
    it('should call filterValues and search for the filter text on the values', () => {
      const dataSource = new ZvTableDataSource<any>(() => of([]), 'client');
      dataSource.tableReady = true;
      spyOn(dataSource, 'filterValues').and.returnValue(['value 1', 'value 2']);

      const obj = { a: 1, b: { b_a: 2 }, 'c c': 3 };
      expect(dataSource.filterPredicate(obj, '1')).toBe(true);
      expect(dataSource.filterPredicate(obj, 'asdf')).toBe(false);
      expect(dataSource.filterValues).toHaveBeenCalledWith(obj);
    });

    it('should work with different casing and values types', () => {
      const dataSource = new ZvTableDataSource<any>(() => of([]), 'client');
      dataSource.tableReady = true;

      expect(dataSource.filterPredicate({ a: 'hallo' }, 'HALLO')).toBe(true);
      expect(dataSource.filterPredicate({ a: true }, 'true')).toBe(true);
      expect(dataSource.filterPredicate({ a: 12 }, '1')).toBe(true);
      expect(dataSource.filterPredicate({ a: new Date(2019, 8, 26) }, '2019')).toBe(true);
    });
  });

  describe('getUpdateDataInfo', () => {
    it('should work', () => {
      const loadTrigger$ = new Subject<string>();
      const dataSource = new ZvTableDataSource({
        loadTrigger$: loadTrigger$,
        loadDataFn: () => of([]),
        mode: 'client',
      });
      dataSource.connect().subscribe();
      loadTrigger$.next('triggered');
      dataSource.tableReady = true;

      dataSource.pageSize = 33;
      dataSource.pageIndex = 7;
      dataSource.filter = 'asdf';
      dataSource.sortColumn = 'sortProp';
      dataSource.sortDirection = 'desc';

      expect(dataSource.getUpdateDataInfo()).toEqual({
        pageSize: 33,
        currentPage: 7,
        searchText: 'asdf',
        sortColumn: 'sortProp',
        sortDirection: 'desc',
      });

      dataSource.pageSize = 5;
      dataSource.pageIndex = 3;
      dataSource.filter = null;
      dataSource.sortColumn = 'a';
      dataSource.sortDirection = 'asc';

      expect(dataSource.getUpdateDataInfo()).toEqual({
        pageSize: 5,
        currentPage: 3,
        searchText: null,
        sortColumn: 'a',
        sortDirection: 'asc',
      });

      expect(dataSource.getUpdateDataInfo(true)).toEqual({
        pageSize: 5,
        currentPage: 3,
        searchText: null,
        sortColumn: 'a',
        sortDirection: 'asc',
        triggerData: 'triggered',
      });

      dataSource.disconnect();
    });
  });

  it('selection should work', () => {
    const loadedData = Array.from(new Array(6).keys()).map((x) => ({ prop: x }));
    const dataSource = new ZvTableDataSource<any>(() => of(loadedData), 'client');
    const sub = dataSource.connect().subscribe();
    dataSource.tableReady = true;
    dataSource.pageIndex = 1;
    dataSource.pageSize = 2;

    dataSource.updateData();

    expect(dataSource.visibleRows).toEqual([{ prop: 2 }, { prop: 3 }]);
    expect(dataSource.allVisibleRowsSelected).toBe(false);

    dataSource.selectVisibleRows();
    expect(dataSource.selectionModel.selected).toEqual([{ prop: 2 }, { prop: 3 }]);
    expect(dataSource.allVisibleRowsSelected).toBe(true);

    dataSource.toggleVisibleRowSelection();
    expect(dataSource.selectionModel.selected).toEqual([]);
    expect(dataSource.allVisibleRowsSelected).toBe(false);

    dataSource.toggleVisibleRowSelection();
    expect(dataSource.selectionModel.selected).toEqual([{ prop: 2 }, { prop: 3 }]);
    expect(dataSource.allVisibleRowsSelected).toBe(true);

    dataSource.selectionModel.clear();
    dataSource.selectionModel.select(dataSource.visibleRows[0]);
    dataSource.toggleVisibleRowSelection();
    expect(dataSource.selectionModel.selected).toEqual([{ prop: 2 }, { prop: 3 }]);
    expect(dataSource.allVisibleRowsSelected).toBe(true);

    sub.unsubscribe();
  });

  it('should update visibleRows but not data on client pagination', () => {
    const loadedData = Array.from(new Array(6).keys()).map((x) => ({ prop: x }));
    const dataSource = new ZvTableDataSource<any>(() => of(loadedData), 'client');
    let renderData: any[] = [];
    const sub = dataSource.connect().subscribe((data) => {
      renderData = data;
    });
    dataSource.tableReady = true;
    dataSource.pageIndex = 1;
    dataSource.pageSize = 2;

    dataSource.updateData();

    expect(dataSource.visibleRows).toEqual([{ prop: 2 }, { prop: 3 }]);
    expect(dataSource.visibleRows).toBe(renderData);
    expect(dataSource.data).toBe(loadedData);

    dataSource.pageIndex = 0;
    dataSource.pageSize = 3;
    dataSource.updateData();

    expect(dataSource.visibleRows).toEqual([{ prop: 0 }, { prop: 1 }, { prop: 2 }]);
    expect(dataSource.visibleRows).toBe(renderData);
    expect(dataSource.data).toBe(loadedData);

    sub.unsubscribe();
  });

  it('should update visibleRows, data and dataLength on server pagination', () => {
    const dataSource = new ZvTableDataSource<any>((filter) => of({ items: [{ prop: filter.currentPage }], totalItems: 100 }), 'server');
    dataSource.tableReady = true;
    dataSource.pageIndex = 0;
    dataSource.pageSize = 1;

    let renderData: any[] = [];
    const sub = dataSource.connect().subscribe((data) => {
      renderData = data;
    });

    dataSource.updateData();

    expect(dataSource.visibleRows).toEqual([{ prop: 0 }]);
    expect(dataSource.visibleRows).toBe(renderData);
    expect(dataSource.data).toEqual([{ prop: 0 }]);
    expect(dataSource.dataLength).toEqual(100);

    dataSource.pageIndex = 5;
    dataSource.updateData();

    expect(dataSource.visibleRows).toEqual([{ prop: 5 }]);
    expect(dataSource.visibleRows).toBe(renderData);
    expect(dataSource.data).toEqual([{ prop: 5 }]);
    expect(dataSource.dataLength).toEqual(100);

    sub.unsubscribe();
  });

  it('should fix pageIndex when currentPage would have no items on server pagination', () => {
    const dataSource = new ZvTableDataSource<any>((filter) => of({ items: [{ prop: filter.currentPage }], totalItems: 1 }), 'server');
    dataSource.tableReady = true;
    dataSource.pageIndex = 1;
    dataSource.pageSize = 1;

    let renderData: any[] = [];
    const sub = dataSource.connect().subscribe((data) => {
      renderData = data;
    });

    dataSource.updateData();

    expect(dataSource.pageIndex).toEqual(0);
    expect(dataSource.visibleRows).toEqual([{ prop: 0 }]);
    expect(dataSource.visibleRows).toBe(renderData);
    expect(dataSource.data).toEqual([{ prop: 0 }]);
    expect(dataSource.dataLength).toEqual(1);

    dataSource.pageIndex = 5;
    dataSource.updateData();

    expect(dataSource.pageIndex).toEqual(0);
    expect(dataSource.visibleRows).toEqual([{ prop: 0 }]);
    expect(dataSource.visibleRows).toBe(renderData);
    expect(dataSource.data).toEqual([{ prop: 0 }]);
    expect(dataSource.dataLength).toEqual(1);

    sub.unsubscribe();
  });

  it('should pass last loadTrigger$ value to loadDataFn', () => {
    const loadTrigger$ = new Subject<string>();
    const loadTriggerValues: string[] = [];
    const dataSource = new ZvTableDataSource<any>({
      loadTrigger$: loadTrigger$,
      loadDataFn: (filter) => {
        loadTriggerValues.push(filter.triggerData);
        return of([]);
      },
    });
    dataSource.tableReady = true;

    const sub = dataSource.connect().subscribe();

    expect(loadTriggerValues).toEqual([]);

    // updateData should call loadDataFn even if loadTrigger$ didn't emit yet
    dataSource.updateData();
    expect(loadTriggerValues).toEqual([null]);

    // loadTrigger$ emit should call loadDataFn with the emitted value
    loadTrigger$.next('test');
    expect(loadTriggerValues).toEqual([null, 'test']);

    // updateData should call loadDataFn with the last emitted loadTrigger$ value
    dataSource.updateData();
    expect(loadTriggerValues).toEqual([null, 'test', 'test']);

    sub.unsubscribe();
  });
});
