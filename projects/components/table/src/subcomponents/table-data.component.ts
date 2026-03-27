import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation, effect, inject, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { ZvTableColumn, ZvTableRowDetail } from '../directives/table.directives';
import { ITableDataSource, IZvTableAction, IZvTableSort, ZvTableActionScope } from '../models';
import { ZvTableActionsComponent } from './table-actions.component';
import { ZvTableRowActionsComponent } from './table-row-actions.component';
import { TableRowDetailComponent } from './table-row-detail.component';

@Component({
  selector: 'zv-table-data',
  templateUrl: './table-data.component.html',
  styleUrls: ['./table-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCheckbox,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatIcon,
    NgStyle,
    NgTemplateOutlet,
    MatMenuTrigger,
    ZvTableActionsComponent,
    ZvTableRowActionsComponent,
    TableRowDetailComponent,
    ZvTableRowDetail,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatSort,
    MatSortHeader,
  ],
})
export class ZvTableDataComponent<TData = unknown> {
  private readonly cd = inject(ChangeDetectorRef);

  public readonly dataSource = input.required<ITableDataSource<TData>>();
  public readonly tableId = input.required<string>();
  public readonly rowDetail = input<ZvTableRowDetail | null>(null);
  public readonly columnDefs = input.required<ZvTableColumn[]>();
  public readonly showListActions = input.required<boolean>();
  public readonly refreshable = input.required<boolean>();
  public readonly settingsEnabled = input.required<boolean>();
  public readonly displayedColumns = input.required<string[]>();
  public readonly showSorting = input.required<boolean>();
  public readonly sortColumn = input.required<string | null>();
  public readonly sortDirection = input.required<'asc' | 'desc'>();
  public readonly showSettingsClicked = output<void>();
  public readonly refreshDataClicked = output<void>();
  public readonly sortChanged = output<IZvTableSort>();

  private refreshAction: IZvTableAction<TData> = {
    icon: 'refresh',
    label: $localize`:@@zvc.refreshList:Refresh list`,
    actionFn: () => this.refreshDataClicked.emit(),
    scope: ZvTableActionScope.list,
  };
  private settingsAction: IZvTableAction<TData> = {
    icon: 'settings',
    label: $localize`:@@zvc.listSettings:List settings`,
    actionFn: () => this.showSettingsClicked.emit(),
    scope: ZvTableActionScope.list,
  };
  public get listActions() {
    const actions = [...this.dataSource().listActions];
    if (this.refreshable()) {
      actions.push(this.refreshAction);
    }
    if (this.settingsEnabled()) {
      actions.push(this.settingsAction);
    }
    return actions;
  }

  constructor() {
    effect((onCleanup) => {
      const ds = this.dataSource();
      if (ds._internalDetectChanges) {
        const sub = ds._internalDetectChanges.subscribe(() => this.cd.markForCheck());
        onCleanup(() => sub.unsubscribe());
      }
    });
  }

  public onSortChanged(sort: Sort) {
    this.sortChanged.emit({ sortColumn: sort.active, sortDirection: sort.direction || 'asc' });
  }

  public toggleRowDetail(item: object) {
    this.rowDetail()!.toggle(item);
    this.cd.markForCheck();
  }

  public onMasterToggleChange() {
    this.dataSource().toggleVisibleRowSelection();
  }

  public onRowToggleChange(row: TData) {
    this.dataSource().selectionModel.toggle(row);
  }

  public isMasterToggleChecked() {
    return this.dataSource().selectionModel.hasValue() && this.dataSource().allVisibleRowsSelected;
  }

  public isMasterToggleIndeterminate() {
    return this.dataSource().selectionModel.hasValue() && !this.dataSource().allVisibleRowsSelected;
  }

  public isRowSelected(row: TData) {
    return this.dataSource().selectionModel.isSelected(row);
  }

  public getSelectedRows() {
    return this.dataSource().selectionModel.selected;
  }

  public showRowDetails(row: object) {
    const showToggle = this.rowDetail()!.showToggleColumn();
    if (typeof showToggle === 'function') {
      return showToggle(row);
    }

    return true;
  }
}
