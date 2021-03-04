import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewEncapsulation,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { IPsTableIntlTexts } from '@prosoft/components/core';
import { PsTableDataSource } from '../data/table-data-source';
import { PsTableColumnDirective, PsTableRowDetailDirective } from '../directives/table.directives';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ps-table-data',
  templateUrl: './table-data.component.html',
  styleUrls: ['./table-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsTableDataComponent implements OnChanges {
  @Input() public dataSource: PsTableDataSource<{ [key: string]: any }>;
  @Input() public tableId: string;
  @Input() public intl: IPsTableIntlTexts;
  @Input() public rowDetail: PsTableRowDetailDirective | null;
  @Input() public columnDefs: PsTableColumnDirective[];
  @Input() public showListActions: boolean;
  @Input() public refreshable: boolean;
  @Input() public settingsEnabled: boolean;
  @Input() public displayedColumns: string[];
  /**
   * @deprecated Please use the action definition in PsTableDataSource
   */
  @Input() public rowActions: TemplateRef<any> | null = null;

  /**
   * @deprecated Please use the action definition in PsTableDataSource
   */
  @Input() public listActions: TemplateRef<any> | null = null;

  @Output() public showSettingsClicked = new EventEmitter<void>();
  @Output() public refreshDataClicked = new EventEmitter<void>();

  private _dataSourceChangesSub = Subscription.EMPTY;

  constructor(private cd: ChangeDetectorRef) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.dataSource) {
      this._dataSourceChangesSub.unsubscribe();
      this._dataSourceChangesSub = this.dataSource._internalDetectChanges.subscribe(() => {
        this.cd.markForCheck();
      });
    }
  }

  public onShowSettingsClicked() {
    this.showSettingsClicked.emit();
  }

  public onRefreshDataClicked() {
    this.refreshDataClicked.emit();
  }

  public toggleRowDetail(item: { [key: string]: any }) {
    this.rowDetail.toggle(item);
    this.cd.markForCheck();
  }

  public onMasterToggleChange() {
    this.dataSource.toggleVisibleRowSelection();
  }

  public onRowToggleChange(row: any) {
    this.dataSource.selectionModel.toggle(row);
  }

  public isMasterToggleChecked() {
    return this.dataSource.selectionModel.hasValue() && this.dataSource.allVisibleRowsSelected;
  }

  public isMasterToggleIndeterminate() {
    return this.dataSource.selectionModel.hasValue() && !this.dataSource.allVisibleRowsSelected;
  }

  public isRowSelected(row: any) {
    return this.dataSource.selectionModel.isSelected(row);
  }

  public getSelectedRows() {
    return this.dataSource.selectionModel.selected;
  }

  public showRowDetails(row: any) {
    if (typeof this.rowDetail.showToggleColumn === 'function') {
      return this.rowDetail.showToggleColumn(row);
    }

    return true;
  }
}
