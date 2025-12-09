import { NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
  inject,
} from '@angular/core';
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
import { Subscription } from 'rxjs';
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
export class ZvTableDataComponent<TData = unknown> implements OnChanges {
  private readonly cd = inject(ChangeDetectorRef);

  @Input() public dataSource!: ITableDataSource<TData>;
  @Input() public tableId!: string;
  @Input() public rowDetail!: ZvTableRowDetail | null;
  @Input() public columnDefs!: ZvTableColumn[];
  @Input() public showListActions!: boolean;
  @Input() public refreshable!: boolean;
  @Input() public settingsEnabled!: boolean;
  @Input() public displayedColumns!: string[];
  @Input() public showSorting!: boolean;
  @Input() public sortColumn!: string | null;
  @Input() public sortDirection!: 'asc' | 'desc';
  @Output() public readonly showSettingsClicked = new EventEmitter<void>();
  @Output() public readonly refreshDataClicked = new EventEmitter<void>();
  @Output() public readonly sortChanged = new EventEmitter<IZvTableSort>();

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
    const actions = [...this.dataSource.listActions];
    if (this.refreshable) {
      actions.push(this.refreshAction);
    }
    if (this.settingsEnabled) {
      actions.push(this.settingsAction);
    }
    return actions;
  }

  private _dataSourceChangesSub = Subscription.EMPTY;

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.dataSource) {
      this._dataSourceChangesSub.unsubscribe();
      if (this.dataSource._internalDetectChanges) {
        this._dataSourceChangesSub = this.dataSource._internalDetectChanges.subscribe(() => {
          this.cd.markForCheck();
        });
      }
    }
  }

  public onSortChanged(sort: Sort) {
    this.sortChanged.emit({ sortColumn: sort.active, sortDirection: sort.direction || 'asc' });
  }

  public toggleRowDetail(item: Record<string, any>) {
    this.rowDetail!.toggle(item);
    this.cd.markForCheck();
  }

  public onMasterToggleChange() {
    this.dataSource.toggleVisibleRowSelection();
  }

  public onRowToggleChange(row: TData) {
    this.dataSource.selectionModel.toggle(row);
  }

  public isMasterToggleChecked() {
    return this.dataSource.selectionModel.hasValue() && this.dataSource.allVisibleRowsSelected;
  }

  public isMasterToggleIndeterminate() {
    return this.dataSource.selectionModel.hasValue() && !this.dataSource.allVisibleRowsSelected;
  }

  public isRowSelected(row: TData) {
    return this.dataSource.selectionModel.isSelected(row);
  }

  public getSelectedRows() {
    return this.dataSource.selectionModel.selected;
  }

  public showRowDetails(row: any) {
    if (typeof this.rowDetail!.showToggleColumn === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return this.rowDetail!.showToggleColumn(row);
    }

    return true;
  }
}
