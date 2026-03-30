import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  output,
  TemplateRef,
  untracked,
  viewChild,
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
    '[class.mat-elevation-z1]': "layout() === 'card'",
    '[class.zv-table--card]': "layout() === 'card'",
    '[class.zv-table--border]': "layout() === 'border'",
    '[class.zv-table--striped]': 'striped()',
    '[class.zv-table--row-detail]': '!!rowDetailQuery()',
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
export class ZvTable<TData = unknown> implements OnInit, OnDestroy {
  public _settingsService = inject(ZvTableSettingsService);
  public _exceptionMessageExtractor = inject(ZvExceptionMessageExtractor);
  public _cd = inject(ChangeDetectorRef);
  public _route = inject(ActivatedRoute);
  public _router = inject(Router);
  public _locale = inject(LOCALE_ID);

  public readonly caption = input('');
  public readonly dataSource = input.required<ITableDataSource<TData>>();
  public readonly tableId = input.required<string>();
  public readonly refreshable = input(true);
  public readonly filterable = input(true);
  public readonly showSettings = input(true);
  public readonly pageDebounce = input<number | null>(null);
  public readonly preferSortDropdown = input(this._settingsService.preferSortDropdown);
  public readonly layout = input<'card' | 'border' | 'flat'>('card');
  public readonly stateManager = input<ZvTableStateManager>(new ZvTableUrlStateManager(this._router, this._route));
  public readonly sortDefinitions = input<IZvTableSortDefinition[]>([]);
  public readonly striped = input(false);

  /** @deprecated use the datasource to detect paginations */
  public readonly page = output<PageEvent>();

  public readonly flipContainer = viewChild.required(ZvFlipContainer);

  public readonly customHeader = contentChild(ZvTableCustomHeaderTemplate, { read: TemplateRef });
  public readonly customSettings = contentChild(ZvTableCustomSettingsTemplate, { read: TemplateRef });
  public readonly topButtonSection = contentChild(ZvTableTopButtonSectionTemplate, { read: TemplateRef });

  public readonly columnDefsQuery = contentChildren(ZvTableColumn);

  public readonly rowDetailQuery = contentChild(ZvTableRowDetail);

  public get rowDetail() {
    return this._rowDetail;
  }

  public pageSizeOptions!: number[];
  public columnDefs: ZvTableColumn[] = [];

  public displayedColumns: string[] = [];

  public get sortDirection(): 'asc' | 'desc' {
    return this.dataSource().sortDirection;
  }

  public set sortDirection(value: 'asc' | 'desc') {
    this.dataSource().sortDirection = value;
  }

  public get sortColumn(): string | null {
    return this.dataSource().sortColumn;
  }

  public set sortColumn(value: string | null) {
    this.dataSource().sortColumn = value;
  }

  public get pageIndex(): number {
    return this.dataSource().pageIndex;
  }

  public set pageIndex(value: number) {
    this.dataSource().pageIndex = value;
  }

  public get pageSize(): number {
    return this.dataSource().pageSize;
  }

  public set pageSize(value: number) {
    this.dataSource().pageSize = value;
  }

  public get dataLength(): number {
    return this.dataSource().dataLength;
  }

  public get filterText(): string {
    return this.dataSource().filter;
  }

  public set filterText(value: string) {
    this.dataSource().filter = value;
  }

  public get showNoEntriesText(): boolean {
    return !this.dataSource().loading && !this.dataSource().error && !this.dataSource().visibleRows.length;
  }

  public get errorMessage(): string | null {
    return this._exceptionMessageExtractor.extractErrorMessage(this.dataSource().error);
  }

  public get showError(): boolean {
    return !!this.dataSource().error;
  }

  public get showLoading(): boolean {
    return this.dataSource().loading;
  }

  public get settingsEnabled(): boolean {
    return !!(this.tableId() && this._settingsService.settingsEnabled && this.showSettings());
  }

  public get showListActions(): boolean {
    return !!this.dataSource().listActions.length || this.settingsEnabled || this.refreshable();
  }

  public get useSortDropdown(): boolean | null {
    return this.preferSortDropdown() || this._sortDefinitions.length !== 0;
  }

  public get showDropdownSorting(): boolean {
    return (this.useSortDropdown && !!this._mergedSortDefinitions.length) ?? false;
  }

  public get mergedSortDefinitions(): IZvTableSortDefinition[] {
    return this._mergedSortDefinitions;
  }

  private subscriptions: Subscription[] = [];
  private _sortDefinitions: IZvTableSortDefinition[] = [];
  private _mergedSortDefinitions: IZvTableSortDefinition[] = [];
  private _tableSettings: Partial<IZvTableSetting> = {};
  private _urlSettings: Partial<IZvTableUpdateDataInfo> = {};
  private _rowDetail: ZvTableRowDetail | null = null;
  private _previousDataSource: ITableDataSource<TData> | null = null;

  constructor() {
    effect(() => {
      const cols = this.columnDefsQuery();
      const sortDefs = this.sortDefinitions();
      const detail = this.rowDetailQuery();
      const ds = this.dataSource();

      untracked(() => {
        this.columnDefs = [...cols];
        this._sortDefinitions = sortDefs ? [...sortDefs] : [];
        this._rowDetail = detail ?? null;

        if (this._previousDataSource && this._previousDataSource !== ds) {
          ds.tableReady = this._previousDataSource.tableReady;
        }
        this._previousDataSource = ds;

        this.mergeSortDefinitions();
        this.updateTableState();
      });
    });
  }

  public ngOnInit() {
    this.dataSource().locale = this._locale;
    this.pageSizeOptions = this._settingsService.pageSizeOptions;
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
      currentPage: 0,
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
    this.dataSource().updateData(true);
  }

  public onSettingsSaved() {
    this.stateManager().remove(this.tableId());
    this.flipContainer().showFront();
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
      ...this.dataSource().getUpdateDataInfo(),
      ...data,
    };
    this.stateManager().requestUpdate(this.tableId(), updateInfo);
  }

  private initListSettingsSubscription() {
    const tableSettings$ = this._settingsService.getStream(this.tableId(), false);
    const stateSettings$ = this.stateManager().createStateSource(this.tableId());
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

            this.dataSource().tableReady = true;
            this.dataSource().updateData(false);
          },
          // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
          error: (err: Error | unknown) => {
            this.dataSource().error = err;
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

    this.displayedColumns = this.columnDefs.map((x) => x.property());
    if (tableSettings.columnBlacklist && tableSettings.columnBlacklist.length) {
      this.displayedColumns = this.displayedColumns.filter((x) => !tableSettings.columnBlacklist!.includes(x));
    }

    // Row Detail Expander aktivieren
    if (this.rowDetail && this.rowDetail.showToggleColumn()) {
      this.displayedColumns.splice(0, 0, 'rowDetailExpander');
    }

    // Selektierung der Rows aktivieren
    if (this.dataSource().listActions.length) {
      this.displayedColumns.splice(0, 0, 'select');
    }

    // Selektierungs- und Row-Aktionen aktivieren
    if (this.showListActions || this.dataSource().rowActions.length) {
      this.displayedColumns.push('options');
    }

    this._cd.markForCheck();
  }

  private mergeSortDefinitions() {
    const sortableColumns = this.columnDefs
      .filter((def) => def.sortable())
      .map((def) => ({ prop: def.property(), displayName: def.header() }) as IZvTableSortDefinition);

    this._mergedSortDefinitions = sortableColumns
      .concat(this._sortDefinitions)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a.displayName.toLocaleLowerCase().localeCompare(b.displayName.toLocaleLowerCase()));
  }
}
