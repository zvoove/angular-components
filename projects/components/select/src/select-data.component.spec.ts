import { QueryList } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { of, Subject } from 'rxjs';
import { PsSelectItem } from './models';
import { PsSelectDataSource } from './select-data-source';
import { PsSelectDataComponent } from './select-data.component';
import { PsSelectService } from './select.service';

function createMatSelect(): MatSelect {
  const matSelect = <any>{
    value: null,
    stateChanges: new Subject<void>(),
    openedChange: new Subject<void>(),
    close: () => {},
    _onChange: () => {},
    _onTouched: null,
    ngControl: new FormControl(),
    options: new QueryList(),
    writeValue: () => {},
  };

  matSelect.writeValue = (val: any) => {
    matSelect.value = val;
  };
  matSelect.registerOnChange = (val: any) => {
    matSelect._onChange = val;
  };
  matSelect.registerOnTouched = (val: any) => {
    matSelect._onTouched = val;
  };

  return matSelect;
}

function createSelectService(): PsSelectService {
  const service = <PsSelectService>{
    createDataSource: (ds: any) => ds,
  };

  return service;
}

function createDataSource(items: PsSelectItem[] = []): PsSelectDataSource {
  const dataSource = <PsSelectDataSource>{
    connect: () => of<PsSelectItem[]>(items),
    disconnect: () => {},
    selectedValuesChanged: (_: any | any[]) => {},
    panelOpenChanged: (_: boolean) => {},
    searchTextChanged: (_: string) => {},
  };

  return dataSource;
}

describe('PsSelectDataComponent', () => {
  let matSelect: MatSelect;
  let dataSource: PsSelectDataSource;
  let service: PsSelectService;
  let component: PsSelectDataComponent;
  beforeEach(() => {
    matSelect = createMatSelect();
    dataSource = createDataSource();
    service = createSelectService();
    component = new PsSelectDataComponent(matSelect, <any>{ control: null }, service, <any>{ markForCheck: () => {} });
    component.options = new QueryList();
    component.dataSource = dataSource;
  });

  it('should take provided compareWith function', fakeAsync(() => {
    const cmpFunc = (_1: any, _2: any) => true;
    dataSource.compareWith = () => false;
    matSelect.compareWith = () => false;

    component.compareWith = cmpFunc;

    expect(matSelect.compareWith).toBe(cmpFunc);
    expect(dataSource.compareWith).toBe(cmpFunc);

    component.ngOnDestroy();
  }));
  it('should take DataSource compareWith function if none is provided', fakeAsync(() => {
    const cmpFunc = (_1: any, _2: any) => true;
    dataSource.compareWith = cmpFunc;
    matSelect.compareWith = () => false;

    component.compareWith = null;

    expect(matSelect.compareWith).toBe(cmpFunc);
    expect(dataSource.compareWith).toBe(cmpFunc);

    component.ngOnDestroy();
  }));
  it('should take MatSelect compareWith function if none is provided and DataSource has none', fakeAsync(() => {
    const cmpFunc = (_1: any, _2: any) => true;
    dataSource.compareWith = null;
    matSelect.compareWith = cmpFunc;

    component.compareWith = null;

    expect(matSelect.compareWith).toBe(cmpFunc);
    expect(dataSource.compareWith).toBe(cmpFunc);

    component.ngOnDestroy();
  }));
  it('should switch to new dataSource when new dataSource is set', fakeAsync(() => {
    expect(component.items).toEqual([]);

    const items = [{ value: 1, label: 'i1', hidden: false }];
    component.dataSource = createDataSource(items);

    expect(component.items).toEqual(items);
  }));
  it("should not switch dataSource when dataSource input doesn't change", fakeAsync(() => {
    expect(component.items).toEqual([]);

    const items = [{ value: 1, label: 'i1', hidden: false }];
    const ds = createDataSource(items);
    spyOn(service, 'createDataSource').and.returnValue(ds);

    component.dataSource = 'a';
    expect(service.createDataSource).toHaveBeenCalledTimes(1);

    component.dataSource = 'lookup';
    expect(service.createDataSource).toHaveBeenCalledTimes(2);

    component.dataSource = 'lookup';
    expect(service.createDataSource).toHaveBeenCalledTimes(2);

    expect(component.items).toEqual(items);
    expect(component.dataSource).toBe(ds);
  }));
  it('should use multiple of matSelect', fakeAsync(() => {
    matSelect.multiple = false;
    expect(component.multiple).toEqual(false);
    matSelect.multiple = true;
    expect(component.multiple).toEqual(true);
  }));
  it('should use error of dataSource', fakeAsync(() => {
    dataSource.error = 'error 123';
    expect(component.error).toEqual('error 123');
  }));
  it('should have hasError true when dataSource has an error', fakeAsync(() => {
    dataSource.error = null;
    expect(component.hasError).toEqual(false);
    dataSource.error = 'error 123';
    expect(component.hasError).toEqual(true);
  }));
  it('should use loading of dataSource', fakeAsync(() => {
    dataSource.loading = false;
    expect(component.loading).toEqual(false);
    dataSource.loading = true;
    expect(component.loading).toEqual(true);
  }));

  it('should have showEmptyInput false for multiple select', fakeAsync(() => {
    matSelect.multiple = true;
    component.clearable = false;
    expect(component.showEmptyInput).toEqual(false);
    component.clearable = true;
    expect(component.showEmptyInput).toEqual(false);
  }));
  it('should right showEmptyInput value for single select', fakeAsync(() => {
    matSelect.multiple = false;
    component.clearable = false;
    expect(component.showEmptyInput).toEqual(false);
    component.clearable = true;
    expect(component.showEmptyInput).toEqual(true);
    component.filterCtrl.patchValue('--');
    expect(component.showEmptyInput).toEqual(true);
    component.filterCtrl.patchValue('ab');
    expect(component.showEmptyInput).toEqual(false);
  }));
  it('should pass MatOptions to MatSelect', fakeAsync(() => {
    const options = [<any>{ a: 'a' }];
    component.options.reset(options);

    component.ngAfterViewInit();
    expect(matSelect.options.toArray()).toEqual(options);

    const newOptions = [<any>{ b: 'b' }];
    component.options.reset(newOptions);
    component.options.notifyOnChanges();
    tick(1);
    expect(matSelect.options.toArray()).toEqual(newOptions);

    component.ngOnDestroy();
  }));
  it('should pass panel open/close from MatSelect to DataSource', fakeAsync(() => {
    component.ngAfterViewInit();

    spyOn(dataSource, 'panelOpenChanged');
    matSelect.openedChange.next(true);

    expect(dataSource.panelOpenChanged).toHaveBeenCalledWith(true);

    component.ngOnDestroy();
  }));
  it('should pass filter value to DataSource', fakeAsync(() => {
    component.ngAfterViewInit();

    spyOn(dataSource, 'searchTextChanged');
    component.filterCtrl.patchValue('asdf');

    expect(dataSource.searchTextChanged).toHaveBeenCalledWith('asdf');

    component.ngOnDestroy();
  }));
  it('should pass selectedValue from MatSelect to DataSource', fakeAsync(() => {
    spyOn(dataSource, 'selectedValuesChanged');

    const initialSelectedValue = { value: 42, label: 'init' };
    matSelect.writeValue(initialSelectedValue);
    component.ngAfterViewInit();
    expect(dataSource.selectedValuesChanged).toHaveBeenCalledWith([initialSelectedValue]);

    const newSelectedValue = { value: 1, label: '1' };

    matSelect.writeValue(newSelectedValue);
    expect(dataSource.selectedValuesChanged).toHaveBeenCalledWith([newSelectedValue]);

    matSelect.writeValue(null);
    expect(dataSource.selectedValuesChanged).toHaveBeenCalledWith([]);

    matSelect.multiple = true;
    matSelect.writeValue(newSelectedValue);
    expect(dataSource.selectedValuesChanged).toHaveBeenCalledWith([newSelectedValue]);

    matSelect._onChange(null);
    expect(dataSource.selectedValuesChanged).toHaveBeenCalledWith([]);

    matSelect._onChange(newSelectedValue);
    expect(dataSource.selectedValuesChanged).toHaveBeenCalledWith([newSelectedValue]);

    component.ngOnDestroy();
  }));
  it('should pass selectedValue, searchText and compareWith when switching to new DataSource', fakeAsync(() => {
    component.ngAfterViewInit();

    const selectedValue = { value: 1, label: '1' };
    const comparer = () => true;

    component.compareWith = comparer;
    component.filterCtrl.patchValue('filter');
    matSelect.writeValue(selectedValue);

    const newDataSource = createDataSource();
    spyOn(newDataSource, 'selectedValuesChanged');
    spyOn(newDataSource, 'searchTextChanged');

    component.dataSource = newDataSource;

    expect(newDataSource.compareWith).toBe(comparer);
    expect(newDataSource.selectedValuesChanged).toHaveBeenCalledWith([selectedValue]);
    expect(newDataSource.searchTextChanged).toHaveBeenCalledWith('filter');

    component.ngOnDestroy();
  }));
  it('should make sure selectedValue is an array before passing it to DataSource', fakeAsync(() => {
    component.ngAfterViewInit();

    spyOn(dataSource, 'selectedValuesChanged');

    // single mode and valid values are already covered by the other test
    matSelect.multiple = true;

    matSelect.writeValue(null);
    expect(dataSource.selectedValuesChanged).toHaveBeenCalledWith([]);

    matSelect.writeValue('');
    expect(dataSource.selectedValuesChanged).toHaveBeenCalledWith([]);

    matSelect.writeValue(false);
    expect(dataSource.selectedValuesChanged).toHaveBeenCalledWith([]);

    matSelect.writeValue(0);
    expect(dataSource.selectedValuesChanged).toHaveBeenCalledWith([]);

    matSelect.writeValue({ something: 'not array' });
    expect(dataSource.selectedValuesChanged).toHaveBeenCalledWith([]);

    component.ngOnDestroy();
  }));
});
