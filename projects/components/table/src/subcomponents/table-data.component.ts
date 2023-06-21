import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { IZvTableIntlTexts } from '@zvoove/components/core';
import { ZvTableDataSource } from '../data/table-data-source';
import { ZvTableColumnDirective, ZvTableRowDetailDirective } from '../directives/table.directives';
import { Subscription } from 'rxjs';

@Component({
  selector: 'zv-table-data',
  templateUrl: './table-data.component.html',
  styleUrls: ['./table-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZvTableDataComponent implements OnChanges {
  @Input() public dataSource: ZvTableDataSource<{ [key: string]: any }>;
  @Input() public tableId: string;
  @Input() public intl: IZvTableIntlTexts;
  @Input() public rowDetail: ZvTableRowDetailDirective | null;
  @Input() public columnDefs: ZvTableColumnDirective[];
  @Input() public showListActions: boolean;
  @Input() public refreshable: boolean;
  @Input() public settingsEnabled: boolean;
  @Input() public displayedColumns: string[];
  @Output() public readonly showSettingsClicked = new EventEmitter<void>();
  @Output() public readonly refreshDataClicked = new EventEmitter<void>();

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
