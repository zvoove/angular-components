import { SelectionModel } from '@angular/cdk/collections';
import { PsTableDataSource } from '../data/table-data-source';
import { PsTableDataComponent } from './table-data.component';

describe('PsTableDataComponent', () => {
  it('onShowSettingsClicked should emit showSettingsClicked', () => {
    const component = new PsTableDataComponent(null);

    spyOn(component.showSettingsClicked, 'emit');
    component.onShowSettingsClicked();
    expect(component.showSettingsClicked.emit).toHaveBeenCalled();
  });

  it('onRefreshDataClicked should emit refreshDataClicked', () => {
    const component = new PsTableDataComponent(null);

    spyOn(component.refreshDataClicked, 'emit');
    component.onRefreshDataClicked();
    expect(component.refreshDataClicked.emit).toHaveBeenCalled();
  });

  it('isMasterToggleChecked should only return true when there are visible rows and they are all selected', () => {
    const component = new PsTableDataComponent(null);
    component.dataSource = createDataSourceMock();

    (<any>component.dataSource).allVisibleRowsSelected = false;
    component.dataSource.selectionModel.select({});
    expect(component.isMasterToggleChecked()).toBe(false);

    (<any>component.dataSource).allVisibleRowsSelected = true;
    component.dataSource.selectionModel.select({});
    expect(component.isMasterToggleChecked()).toBe(true);

    (<any>component.dataSource).allVisibleRowsSelected = true;
    component.dataSource.selectionModel.clear();
    expect(component.isMasterToggleChecked()).toBe(false);
  });

  it('isMasterToggleIndeterminate should only return true when some but not all rows are selected', () => {
    const component = new PsTableDataComponent(null);
    component.dataSource = createDataSourceMock();

    (<any>component.dataSource).allVisibleRowsSelected = false;
    component.dataSource.selectionModel.select({});
    expect(component.isMasterToggleIndeterminate()).toBe(true);

    (<any>component.dataSource).allVisibleRowsSelected = true;
    component.dataSource.selectionModel.select({});
    expect(component.isMasterToggleIndeterminate()).toBe(false);

    (<any>component.dataSource).allVisibleRowsSelected = true;
    component.dataSource.selectionModel.clear();
    expect(component.isMasterToggleIndeterminate()).toBe(false);
  });

  it('toggleRowDetail should toggle the row detail and trigger change detection', () => {
    const cd: any = { markForCheck: () => {} };
    const component = new PsTableDataComponent(cd);
    let toggledRow: any = null;
    component.rowDetail = <any>{
      toggle: (x: any) => {
        toggledRow = x;
      },
    };

    spyOn(cd, 'markForCheck');

    const row = { a: 'b' };
    component.toggleRowDetail(row);

    expect(toggledRow).toBe(row);
    expect(cd.markForCheck).toHaveBeenCalled();
  });

  it('onMasterToggleChange should call toggleVisibleRowSelection on data source', () => {
    const component = new PsTableDataComponent(null);
    component.dataSource = createDataSourceMock();

    spyOn(component.dataSource, 'toggleVisibleRowSelection');
    component.onMasterToggleChange();
    expect(component.dataSource.toggleVisibleRowSelection).toHaveBeenCalled();
  });

  it('onRowToggleChange should toggle row', () => {
    const component = new PsTableDataComponent(null);
    component.dataSource = createDataSourceMock();

    const row = { a: 'b' };
    component.onRowToggleChange(row);

    expect(component.dataSource.selectionModel.isSelected(row)).toBe(true);
    expect(component.dataSource.selectionModel.selected.length).toBe(1);
  });

  it('isRowSelected should only return true if row is selected', () => {
    const component = new PsTableDataComponent(null);
    component.dataSource = createDataSourceMock();

    const row = { a: 'b' };
    component.dataSource.selectionModel.select(row);

    expect(component.isRowSelected(row)).toBe(true);
    expect(component.isRowSelected({})).toBe(false);
  });

  it('getSelectedRows should return selected rows', () => {
    const component = new PsTableDataComponent(null);
    component.dataSource = createDataSourceMock();

    const row1 = { a: 'b' };
    const row2 = { b: 'c' };
    component.dataSource.selectionModel.select(row1, row2);

    expect(component.getSelectedRows()).toEqual([row1, row2]);
  });
});

function createDataSourceMock() {
  const dataSource: PsTableDataSource<any> = ({
    allVisibleRowsSelected: true,
    selectionModel: new SelectionModel(true),
    toggleVisibleRowSelection: () => {},
  } as Partial<PsTableDataSource<any>>) as any;
  return dataSource;
}
