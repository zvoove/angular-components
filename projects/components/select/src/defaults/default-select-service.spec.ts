import { fakeAsync } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { PsSelectItem } from '../models';
import { PsSelectDataSource } from '../select-data-source';
import { PsSelectLoadTrigger } from './default-select-data-source';
import { DefaultPsSelectService } from './default-select-service';

describe('DefaultPsSelectService', () => {
  it('should work with custom DataSource', fakeAsync(() => {
    class TestDataSource implements PsSelectDataSource {
      public loading: boolean;
      public error: any;
      public compareWith: () => true;
      public connect(): Observable<PsSelectItem<any>[]> {
        return of<PsSelectItem<any>[]>([
          {
            label: 'test',
            value: 42,
            hidden: true,
          },
        ]);
      }
      public disconnect(): void {}
      public panelOpenChanged(_: boolean): void {}
      public searchTextChanged(_: string): void {}
      public selectedValuesChanged(_: any): void {}
      public getItemsForValues(_: any[]): PsSelectItem<any>[] {
        return [];
      }
    }
    const service = new DefaultPsSelectService();

    const inDataSource = new TestDataSource();
    const dataSource = service.createDataSource(inDataSource, null);
    expect(dataSource).toBe(inDataSource);

    const renderOptions = getRenderData(dataSource);
    expect(renderOptions).toEqual([{ value: 42, label: 'test', hidden: true }]);
  }));

  it('should work with data object in entity mode', fakeAsync(() => {
    const service = new DefaultPsSelectService();

    const item = { a: 1, b: 'item 1' };
    const dataSource = service.createDataSource({ mode: 'entity', idKey: 'a', labelKey: 'b', items: [item] }, null);

    expectDataSourceOptions(dataSource, PsSelectLoadTrigger.initial, 300);
    expectEntityEqualComparer(dataSource, 'a');
    expectEntityGetItemsForValues(dataSource, 'a', 'b');

    const renderOptions = getRenderData(dataSource);
    expect(renderOptions).toEqual([createOption('item 1', item, item)]);
  }));

  it('should work with data object in id mode', fakeAsync(() => {
    const service = new DefaultPsSelectService();

    const item = { a: 1, b: 'item 1' };
    const dataSource = service.createDataSource({ mode: 'id', idKey: 'a', labelKey: 'b', items: [item] }, null);

    expectDataSourceOptions(dataSource, PsSelectLoadTrigger.initial, 300);
    expectStrictEqualComparer(dataSource);
    expectIdGetItemsForValues(dataSource);

    const renderOptions = getRenderData(dataSource);
    expect(renderOptions).toEqual([createOption('item 1', 1, item)]);
  }));

  it('should work with data observable and custom options', fakeAsync(() => {
    const service = new DefaultPsSelectService();

    const item = { x: 1, y: 'item 1' };
    const dataSource = service.createDataSource(
      {
        mode: 'entity',
        idKey: 'x',
        labelKey: 'y',
        items: of([item]),
        searchDebounce: 100,
        loadTrigger: PsSelectLoadTrigger.firstPanelOpen,
      },
      null
    );

    expectDataSourceOptions(dataSource, PsSelectLoadTrigger.firstPanelOpen, 100);
    expectEntityEqualComparer(dataSource, 'x');
    expectEntityGetItemsForValues(dataSource, 'x', 'y');

    const renderOptions = getRenderData(dataSource);
    expect(renderOptions).toEqual([createOption('item 1', item, item)]);
  }));

  it('should work with data array', fakeAsync(() => {
    const service = new DefaultPsSelectService();

    const item = { value: 1, label: 'item 1' };
    const dataSource = service.createDataSource([item], null);

    expectDataSourceOptions(dataSource, PsSelectLoadTrigger.initial, 300);
    expectStrictEqualComparer(dataSource);
    expectIdGetItemsForValues(dataSource);

    const renderOptions = getRenderData(dataSource);
    expect(renderOptions).toEqual([createOption('item 1', 1, item)]);
  }));

  it('should work with observable array', fakeAsync(() => {
    const service = new DefaultPsSelectService();

    const item = { value: 1, label: 'item 1' };
    const dataSource = service.createDataSource(of([item]), null);

    expectDataSourceOptions(dataSource, PsSelectLoadTrigger.initial, 300);
    expectStrictEqualComparer(dataSource);
    expectIdGetItemsForValues(dataSource);

    const renderOptions = getRenderData(dataSource);
    expect(renderOptions).toEqual([createOption('item 1', 1, item)]);
  }));

  it('should set disabled to value of item[disabledKey]', fakeAsync(() => {
    const service = new DefaultPsSelectService();

    const item = { a: 1, b: 'item 1', d: true };
    const dataSource = service.createDataSource({ mode: 'entity', idKey: 'a', labelKey: 'b', disabledKey: 'd', items: [item] }, null);

    const renderOptions = getRenderData(dataSource);
    expect(renderOptions).toEqual([createOption('item 1', item, item, false, true)]);
  }));
});

function getRenderData(dataSource: PsSelectDataSource) {
  let currentRenderOptions;
  dataSource.connect().subscribe((options) => {
    currentRenderOptions = options;
  });
  dataSource.panelOpenChanged(true); // Just in case the loadTrigger is not Initial
  dataSource.disconnect();
  return currentRenderOptions;
}

function expectStrictEqualComparer(dataSource: PsSelectDataSource) {
  expect(dataSource.compareWith('item 1', 'item 1')).toBeTruthy();
  expect(dataSource.compareWith(1, 1)).toBeTruthy();
  const obj = { objectUuid: 1 };
  expect(dataSource.compareWith(obj, obj)).toBeTruthy();

  expect(dataSource.compareWith('item 1', 'item 2')).toBeFalsy();
  expect(dataSource.compareWith(1, 2)).toBeFalsy();
  expect(dataSource.compareWith({ objectUuid: 1 }, { objectUuid: 1 })).toBeFalsy();
}

function expectEntityEqualComparer(dataSource: PsSelectDataSource, idKey: string) {
  expect(dataSource.compareWith('item 1', 'item 1')).toBeTruthy();
  expect(dataSource.compareWith(1, 1)).toBeTruthy();
  expect(dataSource.compareWith({ [idKey]: 1, [idKey + 'label']: 'asdf' }, { [idKey]: 1, [idKey + 'label']: 'ghjk' })).toBeTruthy();

  expect(dataSource.compareWith('item 1', 'item 2')).toBeFalsy();
  expect(dataSource.compareWith(1, 2)).toBeFalsy();
  expect(dataSource.compareWith({ [idKey]: 1 }, { [idKey]: 2 })).toBeFalsy();
  expect(dataSource.compareWith({ [idKey]: 1 }, 1)).toBeFalsy();
}

function expectIdGetItemsForValues(dataSource: PsSelectDataSource) {
  // getItemsForValues must set the right value and label must contain at least the id
  const convertedValues = dataSource.getItemsForValues([42]);
  expect(convertedValues[0].value).toEqual(42);
  expect(convertedValues[0].label).toContain('42');
}

function expectEntityGetItemsForValues(dataSource: PsSelectDataSource, idKey: string, labelKey: string) {
  const convertedValues = dataSource.getItemsForValues([{ [idKey]: 2, [labelKey]: 'label 2' }]);
  expect(convertedValues[0].value).toEqual({ [idKey]: 2, [labelKey]: 'label 2' });
  expect(convertedValues[0].label).toContain('label 2');
}

function expectDataSourceOptions(dataSource: any, loadTrigger: PsSelectLoadTrigger, debounceTime: number) {
  expect(dataSource._loadTrigger).toEqual(loadTrigger);
  expect(dataSource._searchDebounceTime).toEqual(debounceTime);
}

function createOption(label: string, value: any, entity: any, hidden = false, disabled = false): PsSelectItem {
  return {
    label: label,
    value: value,
    entity: entity,
    hidden: hidden,
    disabled: disabled,
  };
}
