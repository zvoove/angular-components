import { SelectionModel } from '@angular/cdk/collections';
import { TestBed } from '@angular/core/testing';
import { ZvTableDataSource } from '../data/table-data-source';
import { ZvTableDataComponent } from './table-data.component';

describe('ZvTableDataComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
    });
  });
  it('onSortChanged should emit sortChanged', () => {
    const component = TestBed.createComponent(ZvTableDataComponent).componentInstance;

    spyOn(component.sortChanged, 'emit');
    component.onSortChanged({ active: 'test', direction: 'asc' });
    expect(component.sortChanged.emit).toHaveBeenCalledWith({ sortColumn: 'test', sortDirection: 'asc' });

    component.onSortChanged({ active: 'test2', direction: null });
    expect(component.sortChanged.emit).toHaveBeenCalledWith({ sortColumn: 'test2', sortDirection: 'asc' });

    component.onSortChanged({ active: 'test3', direction: 'desc' });
    expect(component.sortChanged.emit).toHaveBeenCalledWith({ sortColumn: 'test3', sortDirection: 'desc' });

    expect(component.sortChanged.emit).toHaveBeenCalledTimes(3);
  });

  it('isMasterToggleChecked should only return true when there are visible rows and they are all selected', () => {
    const component = TestBed.createComponent(ZvTableDataComponent).componentInstance;
    component.dataSource = createDataSourceMock();

    (component.dataSource as any).allVisibleRowsSelected = false;
    component.dataSource.selectionModel.select({});
    expect(component.isMasterToggleChecked()).toBe(false);

    (component.dataSource as any).allVisibleRowsSelected = true;
    component.dataSource.selectionModel.select({});
    expect(component.isMasterToggleChecked()).toBe(true);

    (component.dataSource as any).allVisibleRowsSelected = true;
    component.dataSource.selectionModel.clear();
    expect(component.isMasterToggleChecked()).toBe(false);
  });

  it('isMasterToggleIndeterminate should only return true when some but not all rows are selected', () => {
    const component = TestBed.createComponent(ZvTableDataComponent).componentInstance;
    component.dataSource = createDataSourceMock();

    (component.dataSource as any).allVisibleRowsSelected = false;
    component.dataSource.selectionModel.select({});
    expect(component.isMasterToggleIndeterminate()).toBe(true);

    (component.dataSource as any).allVisibleRowsSelected = true;
    component.dataSource.selectionModel.select({});
    expect(component.isMasterToggleIndeterminate()).toBe(false);

    (component.dataSource as any).allVisibleRowsSelected = true;
    component.dataSource.selectionModel.clear();
    expect(component.isMasterToggleIndeterminate()).toBe(false);
  });

  it('toggleRowDetail should toggle the row detail and trigger change detection', () => {
    const fixture = TestBed.createComponent(ZvTableDataComponent);
    const component = fixture.componentInstance;

    // overwrite the component's cd as testbed provider is ignored
    const cdSpy = { markForCheck: jasmine.createSpy('markForCheck') };
    (component as any).cd = cdSpy;

    let toggledRow: any = null;
    component.rowDetail = {
      toggle: (x: any) => {
        toggledRow = x;
      },
    } as any;

    const row = { a: 'b' };
    component.toggleRowDetail(row);

    expect(toggledRow).toBe(row);
    expect(cdSpy.markForCheck).toHaveBeenCalled();
  });

  it('onMasterToggleChange should call toggleVisibleRowSelection on data source', () => {
    const component = TestBed.createComponent(ZvTableDataComponent).componentInstance;
    component.dataSource = createDataSourceMock();

    spyOn(component.dataSource, 'toggleVisibleRowSelection');
    component.onMasterToggleChange();
    expect(component.dataSource.toggleVisibleRowSelection).toHaveBeenCalled();
  });

  it('onRowToggleChange should toggle row', () => {
    const component = TestBed.createComponent(ZvTableDataComponent).componentInstance;
    component.dataSource = createDataSourceMock();

    const row = { a: 'b' };
    component.onRowToggleChange(row);

    expect(component.dataSource.selectionModel.isSelected(row)).toBe(true);
    expect(component.dataSource.selectionModel.selected.length).toBe(1);
  });

  it('isRowSelected should only return true if row is selected', () => {
    const component = TestBed.createComponent(ZvTableDataComponent).componentInstance;
    component.dataSource = createDataSourceMock();

    const row = { a: 'b' };
    component.dataSource.selectionModel.select(row);

    expect(component.isRowSelected(row)).toBe(true);
    expect(component.isRowSelected({})).toBe(false);
  });

  it('getSelectedRows should return selected rows', () => {
    const component = TestBed.createComponent(ZvTableDataComponent).componentInstance;
    component.dataSource = createDataSourceMock();

    const row1 = { a: 'b' };
    const row2 = { b: 'c' };
    component.dataSource.selectionModel.select(row1, row2);

    expect(component.getSelectedRows()).toEqual([row1, row2]);
  });
});

function createDataSourceMock() {
  const dataSource: ZvTableDataSource<any> = {
    allVisibleRowsSelected: true,
    selectionModel: new SelectionModel(true),
    toggleVisibleRowSelection: () => {},
  } as Partial<ZvTableDataSource<any>> as any;
  return dataSource;
}
