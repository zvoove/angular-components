import type { QueryList } from '@angular/core';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  LOCALE_ID,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { ZvExceptionMessageExtractor } from '@zvoove/components/core';
import { ZvFlipContainer, ZvFlipContainerModule } from '@zvoove/components/flip-container';
import { combineLatest, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
  ZvTableColumn,
  ZvTableCustomHeaderTemplate,
  ZvTableCustomSettingsTemplate,
  ZvTableRowDetail,
  ZvTableTopButtonSectionTemplate,
} from './directives/table.directives';
import { ZvTableStateManager, ZvTableUrlStateManager } from './helper/state-manager';
import { ITableDataSource, IZvTableSort, IZvTableSortDefinition, IZvTableUpdateDataInfo } from './models';
import { IZvTableSetting, ZvTableSettingsService } from './services/table-settings.service';
import { ZvTableDataComponent } from './subcomponents/table-data.component';
import { ZvTableHeaderComponent } from './subcomponents/table-header.component';
import { ZvTablePaginationComponent } from './subcomponents/table-pagination.component';
import { ZvTableSettingsComponent } from './subcomponents/table-settings.component';

@Component({
  selector: 'zv-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  host: {
    '[class.mat-elevation-z1]': `layout === 'card'`,
    '[class.zv-table--card]': `layout === 'card'`,
    '[class.zv-table--border]': `layout === 'border'`,
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ZvFlipContainerModule,
    ZvTableHeaderComponent,
    ZvBlockUi,
    ZvTableDataComponent,
    ZvTablePaginationComponent,
    ZvTableSettingsComponent,
  ],
})
export class ZvTable<TData = unknown> implements OnInit, OnChanges, AfterContentInit, OnDestroy {
  public _settingsService = inject(ZvTableSettingsService);
  public _exceptionMessageExtractor = inject(ZvExceptionMessageExtractor);
  public _cd = inject(ChangeDetectorRef);
  public _route = inject(ActivatedRoute);
  public _router = inject(Router);
  public _locale = inject(LOCALE_ID);

  @Input() public caption = '';
  @Input({ required: true }) public dataSource!: ITableDataSource<TData>;
  @Input({ required: true }) public tableId!: string;
  @Input()
  public set sortDefinitions(value: IZvTableSortDefinition[]) {
    this._sortDefinitions = value ? [...value] : [];
    this.mergeSortDefinitions();
  }

  public get sortDefinitions(): IZvTableSortDefinition[] {
    return this._mergedSortDefinitions;
  }

  @Input() public refreshable = true;
  @Input() public filterable = true;
  @Input() public showSettings = true;
  @Input() public pageDebounce: number | null = null;
  @Input() public preferSortDropdown = this._settingsService.preferSortDropdown;

  @Input()
  public layout: 'card' | 'border' | 'flat' = 'card';

  @Input()
  @HostBinding('class.zv-table--striped')
  public striped = false;

  @Input() stateManager: ZvTableStateManager = new ZvTableUrlStateManager(this._router, this._route);

  /** @deprecated use the datasource to detect paginations */
  @Output() public readonly page = new EventEmitter<PageEvent>();

  @ViewChild(ZvFlipContainer, { static: true }) public flipContainer!: ZvFlipContainer;

  @ContentChild(ZvTableCustomHeaderTemplate, { read: TemplateRef })
  public set customHeader(value: TemplateRef<unknown> | null) {
    this._customHeader = value;
    this._cd.markForCheck();
  }

  public get customHeader() {
    return this._customHeader;
  }

  private _customHeader: TemplateRef<unknown> | null = null;

  @ContentChild(ZvTableCustomSettingsTemplate, { read: TemplateRef })
  public set customSettings(value: TemplateRef<unknown> | null) {
    this._customSettings = value;
    this._cd.markForCheck();
  }

  public get customSettings() {
    return this._customSettings;
  }

  private _customSettings: TemplateRef<unknown> | null = null;

  @ContentChild(ZvTableTopButtonSectionTemplate, { read: TemplateRef })
  public set topButtonSection(value: TemplateRef<unknown> | null) {
    this._topButtonSection = value;
    this._cd.markForCheck();
  }

  public get topButtonSection() {
    return this._topButtonSection;
  }

  private _topButtonSection: TemplateRef<unknown> | null = null;

  @ContentChildren(ZvTableColumn)
  public set columnDefsSetter(queryList: QueryList<ZvTableColumn>) {
    this.columnDefs = [...queryList.toArray()];
    this.mergeSortDefinitions();
    this.updateTableState();
  }

  @HostBinding('class.zv-table--row-detail')
  @ContentChild(ZvTableRowDetail)
  public set rowDetail(value: ZvTableRowDetail | null) {
    this._rowDetail = value;
    this.updateTableState();
  }

  public get rowDetail() {
    return this._rowDetail;
  }

  private _rowDetail: ZvTableRowDetail | null = null;

  public pageSizeOptions!: number[];
  public columnDefs: ZvTableColumn[] = [];

  public displayedColumns: string[] = [];

  public get sortDirection(): 'asc' | 'desc' {
    return this.dataSource.sortDirection;
  }

  public set sortDirection(value: 'asc' | 'desc') {
    this.dataSource.sortDirection = value;
  }

  public get sortColumn(): string | null {
    return this.dataSource.sortColumn;
  }

  public set sortColumn(value: string | null) {
    this.dataSource.sortColumn = value;
  }

  public get pageIndex(): number {
    return this.dataSource.pageIndex;
  }

  public set pageIndex(value: number) {
    this.dataSource.pageIndex = value;
  }

  public get pageSize(): number {
    return this.dataSource.pageSize;
  }

  public set pageSize(value: number) {
    this.dataSource.pageSize = value;
  }

  public get dataLength(): number {
    return this.dataSource.dataLength;
  }

  public get filterText(): string {
    return this.dataSource.filter;
  }

  public set filterText(value: string) {
    this.dataSource.filter = value;
  }

  public get showNoEntriesText(): boolean {
    return !this.dataSource.loading && !this.dataSource.error && !this.dataSource.visibleRows.length;
  }

  public get errorMessage(): string | null {
    return this._exceptionMessageExtractor.extractErrorMessage(this.dataSource.error);
  }

  public get showError(): boolean {
    return !!this.dataSource.error;
  }

  public get showLoading(): boolean {
    return this.dataSource.loading;
  }

  public get settingsEnabled(): boolean {
    return !!(this.tableId && this._settingsService.settingsEnabled && this.showSettings);
  }

  public get showListActions(): boolean {
    return !!this.dataSource.listActions.length || this.settingsEnabled || this.refreshable;
  }

  public get useSortDropdown(): boolean | null {
    return this.preferSortDropdown || this._sortDefinitions.length !== 0;
  }

  public get showDropdownSorting(): boolean {
    return (this.useSortDropdown && !!this._mergedSortDefinitions.length) ?? false;
  }

  private subscriptions: Subscription[] = [];
  private _sortDefinitions: IZvTableSortDefinition[] = [];
  private _mergedSortDefinitions: IZvTableSortDefinition[] = [];
  private _tableSettings: Partial<IZvTableSetting> = {};
  private _urlSettings: Partial<IZvTableUpdateDataInfo> = {};

  public ngOnInit() {
    this.dataSource.locale = this._locale;
    this.pageSizeOptions = this._settingsService.pageSizeOptions;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.dataSource && !changes.dataSource.firstChange) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.dataSource.tableReady = changes.dataSource.previousValue.tableReady as unknown as boolean;
    }

    this.updateTableState();
  }

  public ngAfterContentInit(): void {
    // This can't happen earlier, otherwise the ContentChilds would not be resolved yet
    this.initListSettingsSubscription();
  }

  public ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach((s) => s.unsubscribe());
    }
  }

  public onSearchChanged(value: string | null) {
    this.requestUpdate({
      searchText: value,
    });
  }

  public onSortChanged(event: IZvTableSort) {
    this.requestUpdate({
      sortColumn: event.sortColumn,
      sortDirection: event.sortDirection,
    });
  }

  public onPage(event: PageEvent) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    this.page.emit(event);
    this.requestUpdate({
      currentPage: event.pageIndex,
      pageSize: event.pageSize,
    });
  }

  public onRefreshDataClicked() {
    this.dataSource.updateData(true);
  }

  public onSettingsSaved() {
    this.stateManager.remove(this.tableId);
    this.flipContainer.showFront();
  }

  /** @public This is a public api */
  public toggleRowDetail(item: TData, open?: boolean) {
    if (!this.rowDetail) {
      return;
    }

    this.rowDetail.toggle(item as object, open);
  }

  private requestUpdate(data: Partial<IZvTableUpdateDataInfo>) {
    const updateInfo = {
      ...this.dataSource.getUpdateDataInfo(),
      ...data,
    };
    this.stateManager.requestUpdate(this.tableId, updateInfo);
  }

  private initListSettingsSubscription() {
    const tableSettings$ = this._settingsService.getStream(this.tableId, false);
    const stateSettings$ = this.stateManager.createStateSource(this.tableId);
    this.subscriptions.push(
      combineLatest([stateSettings$, tableSettings$])
        .pipe(
          // guards against multiple data updates, when multiple emits happen at the same time.
          debounceTime(0)
        )
        .subscribe({
          next: ([urlSettings, tableSettings]) => {
            this._urlSettings = urlSettings || {};
            this._tableSettings = tableSettings || {};

            // Paging, Sorting, Filter und Display Columns updaten
            this.updateTableState();

            this.dataSource.tableReady = true;
            this.dataSource.updateData(false);
          },
          // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
          error: (err: Error | unknown) => {
            this.dataSource.error = err;
          },
        })
    );
  }

  private updateTableState() {
    const tableSettings = this._tableSettings;
    const urlSettings = this._urlSettings;

    this.pageIndex = Math.max(urlSettings.currentPage || 0, 0);
    this.pageSize = Math.max(urlSettings.pageSize || tableSettings.pageSize || 15, 1);
    this.sortColumn = urlSettings.sortColumn || tableSettings.sortColumn || null;
    this.sortDirection = urlSettings.sortDirection || tableSettings.sortDirection || 'asc';
    this.filterText = urlSettings.searchText || '';

    this.displayedColumns = this.columnDefs.map((x) => x.property);
    if (tableSettings.columnBlacklist && tableSettings.columnBlacklist.length) {
      this.displayedColumns = this.displayedColumns.filter((x) => !tableSettings.columnBlacklist!.includes(x));
    }

    // Row Detail Expander aktivieren
    if (this.rowDetail && this.rowDetail.showToggleColumn) {
      this.displayedColumns.splice(0, 0, 'rowDetailExpander');
    }

    // Selektierung der Rows aktivieren
    if (this.dataSource.listActions.length) {
      this.displayedColumns.splice(0, 0, 'select');
    }

    // Selektierungs- und Row-Aktionen aktivieren
    if (this.showListActions || this.dataSource.rowActions.length) {
      this.displayedColumns.push('options');
    }

    this._cd.markForCheck();
  }

  private mergeSortDefinitions() {
    const sortableColumns = this.columnDefs
      .filter((def) => def.sortable)
      .map((def) => ({ prop: def.property, displayName: def.header }) as IZvTableSortDefinition);

    this._mergedSortDefinitions = sortableColumns
      .concat(this._sortDefinitions)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a.displayName.toLocaleLowerCase().localeCompare(b.displayName.toLocaleLowerCase()));
  }
}
