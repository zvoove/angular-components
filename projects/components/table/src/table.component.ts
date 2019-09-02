import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  AfterContentInit,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { IPsTableIntlTexts, PsIntlService, PsExceptionMessageExtractor } from '@prosoft/components/core';
import { PsFlipContainerComponent } from '@prosoft/components/flip-container';
import { combineLatest, Subject, Subscription } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { PsTableDataSource } from './data/table-data-source';
import {
  PsTableColumnDirective,
  PsTableCustomHeaderDirective,
  PsTableListActionsDirective,
  PsTableRowActionsDirective,
  PsTableRowDetailDirective,
  PsTableTopButtonSectionDirective,
} from './directives/table.directives';
import { asQueryParams, fromQueryParams } from './helper/table.helper';
import { IPsTableSortDefinition, IPsTableUpdateDataInfo } from './models';
import { IPsTableSetting, PsTableSettingsService } from './services/table-settings.service';

@Component({
  selector: 'ps-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsTableComponent implements OnInit, OnChanges, AfterContentInit, OnDestroy {
  @Input() public caption: string;
  @Input() public dataSource: PsTableDataSource<{ [key: string]: any }>;
  @Input() public tableId: string;
  @Input() public intlOverride: Partial<IPsTableIntlTexts>;
  @Input()
  public set sortDefinitions(value: IPsTableSortDefinition[]) {
    if (!value) {
      return;
    }

    this._sortDefinitions = [...value];
    this.mergeSortDefinitions();
  }

  public get sortDefinitions(): IPsTableSortDefinition[] {
    return this._mergedSortDefinitions;
  }

  @Input() public refreshable = true;
  @Input() public filterable = true;
  @Input() public showSettings = true;

  @Input()
  @HostBinding('class.mat-elevation-z3')
  public cardLayout = true;

  @Input()
  @HostBinding('class.ps-table--striped')
  public striped = false;

  @Output() public page = new EventEmitter<PageEvent>();

  @ViewChild(MatPaginator, { static: false }) public set paginator(value: MatPaginator | null) {
    this._paginator = value;
    this.updatePaginatorIntl();
  }
  public get paginator(): MatPaginator | null {
    return this._paginator;
  }
  private _paginator: MatPaginator | null = null;

  @ViewChild(PsFlipContainerComponent, { static: true }) public flipContainer: PsFlipContainerComponent | null = null;

  @ContentChild(PsTableCustomHeaderDirective, { read: TemplateRef, static: false })
  public customHeader: TemplateRef<any> | null = null;

  @ContentChild(PsTableTopButtonSectionDirective, { read: TemplateRef, static: false })
  public topButtonSection: TemplateRef<any> | null = null;

  @ContentChild(PsTableListActionsDirective, { read: TemplateRef, static: false })
  public listActions: TemplateRef<any> | null = null;

  @ContentChild(PsTableRowActionsDirective, { read: TemplateRef, static: false })
  public rowActions: TemplateRef<any> | null = null;

  @ContentChildren(PsTableColumnDirective)
  public set columnDefsSetter(queryList: QueryList<PsTableColumnDirective>) {
    this.columnDefs = [...queryList.toArray()];
    this.mergeSortDefinitions();
  }

  @HostBinding('class.ps-table--row-detail')
  @ContentChild(PsTableRowDetailDirective, { static: false })
  public rowDetail: PsTableRowDetailDirective | null = null;

  public pageSizeOptions: number[];
  public columnDefs: PsTableColumnDirective[] = [];

  public displayedColumns: string[] = [];

  public get sortDirection(): 'asc' | 'desc' {
    return this.dataSource.sortDirection;
  }
  public set sortDirection(value: 'asc' | 'desc') {
    this.dataSource.sortDirection = value;
  }

  public get sortColumn(): string {
    return this.dataSource.sortColumn;
  }
  public set sortColumn(value: string) {
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

  public get filterText(): string {
    return this.dataSource.filter;
  }
  public set filterText(value: string) {
    this.dataSource.filter = value;
  }

  public get showNoEntriesText(): boolean {
    return !this.dataSource.loading && !this.dataSource.error && !this.dataSource.visibleRows.length;
  }

  public get errorMessage(): string {
    return this.exceptionMessageExtractor.extractErrorMessage(this.dataSource.error);
  }
  public get showError(): boolean {
    return !!this.dataSource.error;
  }
  public get showLoading(): boolean {
    return this.dataSource.loading;
  }
  public get settingsEnabled(): boolean {
    return !!(this.tableId && this.settingsService.settingsEnabled && this.showSettings);
  }
  public get showListActions(): boolean {
    return !!this.listActions || this.settingsEnabled || this.refreshable;
  }
  public get showSorting(): boolean {
    return !!this._mergedSortDefinitions.length;
  }

  public intl: IPsTableIntlTexts;

  private subscriptions: Subscription[] = [];
  private _sortDefinitions: IPsTableSortDefinition[] = [];
  private _mergedSortDefinitions: IPsTableSortDefinition[] = [];
  private _intlChangesSub: Subscription;

  constructor(
    public intlService: PsIntlService,
    public settingsService: PsTableSettingsService,
    private exceptionMessageExtractor: PsExceptionMessageExtractor,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(LOCALE_ID) private _locale: string
  ) {}

  public ngOnInit() {
    this._intlChangesSub = this.intlService.intlChanged$.pipe(startWith(null as any)).subscribe(() => {
      this.updateIntl();
      this.cd.markForCheck();
    });

    this.pageSizeOptions = this.settingsService.pageSizeOptions;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.intlOverride) {
      this.updateIntl();
    }

    if (changes.dataSource) {
      this.dataSource.locale = this._locale;
      if (!changes.dataSource.firstChange) {
        this.dataSource.updateData();
      }
    }
  }

  public ngAfterContentInit(): void {
    // This can't happen earlier, otherwise the ContentChilds would not be resolved yet
    this.initListSettingsSubscription();
  }

  public ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach(s => s.unsubscribe());
    }

    if (this._intlChangesSub) {
      this._intlChangesSub.unsubscribe();
    }
  }

  public onSearchChanged(value: string) {
    this.filterText = value;
    this.requestUpdate();
  }

  public onSortChanged(event: { sortColumn: string; sortDirection: 'asc' | 'desc' }) {
    this.sortColumn = event.sortColumn;
    this.sortDirection = event.sortDirection;
    this.requestUpdate();
  }

  public onPage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.page.emit(event);
    this.requestUpdate();
  }

  public onRefreshDataClicked() {
    this.dataSource.updateData();
  }

  public onSettingsSaved() {
    const currentParams = this.route.snapshot.queryParamMap;
    const newQueryParams: { [id: string]: any } = {};
    for (const key of currentParams.keys) {
      if (key !== this.tableId) {
        newQueryParams[key] = currentParams.get(key);
      }
    }

    this.router.navigate([], {
      queryParams: newQueryParams,
      relativeTo: this.route,
    });

    this.flipContainer.toggleFlip();
  }

  private requestUpdate() {
    const newQueryParams: { [id: string]: any } = {};

    const currentParams = this.route.snapshot.queryParamMap;
    for (const key of currentParams.keys) {
      newQueryParams[key] = currentParams.get(key);
    }

    if (this.tableId) {
      const updateInfo = this.dataSource.getUpdateDataInfo();
      newQueryParams[this.tableId] = asQueryParams(updateInfo);
    }

    this.router.navigate([], {
      queryParams: newQueryParams,
      relativeTo: this.route,
    });
  }

  private initListSettingsSubscription() {
    const tableSettings$ = this.settingsService.settings$.pipe(
      map(settings => {
        if (this.tableId && settings && settings[this.tableId]) {
          return settings[this.tableId];
        }
        return null;
      })
    );
    const urlSettings$ = this.route.queryParamMap.pipe(
      map(queryParamMap => {
        if (this.tableId && queryParamMap.has(this.tableId)) {
          return fromQueryParams(queryParamMap.get(this.tableId));
        }
        return null;
      })
    );
    this.subscriptions.push(
      combineLatest([urlSettings$, tableSettings$, this.settingsService.defaultPageSize$])
        .pipe(
          // guards agains multiple data updates, when multiple emits happen at the same time.
          debounceTime(0)
        )
        .subscribe({
          next: ([urlSettings, savedSettings, defaultPageSize]) => {
            // Paging, Sorting, Filter und Display Columns updaten
            this.updateTableState(savedSettings, urlSettings, defaultPageSize);

            // Row Detail Expander aktivieren
            if (this.rowDetail && this.rowDetail.showToggleColumn) {
              this.displayedColumns.splice(0, 0, 'rowDetailExpander');
            }

            // Selektierung der Rows aktivieren
            if (this.listActions) {
              this.displayedColumns.splice(0, 0, 'select');
            }

            // Selektierungs- und Row-Aktionen aktivieren
            if (this.showListActions || this.rowActions) {
              this.displayedColumns.push('options');
            }

            this.cd.markForCheck();
            this.dataSource.updateData(false);
          },
          error: (err: Error | any) => {
            this.dataSource.error = err;
          },
        })
    );
  }

  private updateTableState(tableSettings: Partial<IPsTableSetting>, urlSettings: Partial<IPsTableUpdateDataInfo>, defaultPageSize: number) {
    tableSettings = tableSettings || {};
    urlSettings = urlSettings || {};

    this.pageIndex = Math.max(urlSettings.currentPage || 0, 0);
    this.pageSize = Math.max(urlSettings.pageSize || tableSettings.pageSize || defaultPageSize, 1);
    this.sortColumn = urlSettings.sortColumn || tableSettings.sortColumn || null;
    this.sortDirection = urlSettings.sortDirection || tableSettings.sortDirection || 'asc';
    this.filterText = urlSettings.searchText || '';

    this.displayedColumns = this.columnDefs.map(x => x.property);
    if (tableSettings.columnBlacklist && tableSettings.columnBlacklist.length) {
      this.displayedColumns = this.displayedColumns.filter(x => !tableSettings.columnBlacklist.includes(x));
    }
  }

  private mergeSortDefinitions() {
    const sortableColumns = this.columnDefs
      .filter(def => def.sortable)
      .map(def => <IPsTableSortDefinition>{ prop: def.property, displayName: def.header });

    this._mergedSortDefinitions = sortableColumns
      .concat(this._sortDefinitions)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a.displayName.toLocaleLowerCase().localeCompare(b.displayName.toLocaleLowerCase()));
    this.cd.markForCheck();
  }

  private updateIntl() {
    const intl = this.intlService.get('table');
    this.intl = this.intlService.merge(intl, this.intlOverride);

    this.updatePaginatorIntl();
  }

  private updatePaginatorIntl() {
    if (this.paginator && this.intl) {
      this.paginator._intl.firstPageLabel = this.intl.firstPageLabel;
      this.paginator._intl.lastPageLabel = this.intl.lastPageLabel;
      this.paginator._intl.previousPageLabel = this.intl.previousPageLabel;
      this.paginator._intl.nextPageLabel = this.intl.nextPageLabel;
      this.paginator._intl.itemsPerPageLabel = this.intl.itemsPerPageLabel;
      this.paginator._intl.getRangeLabel = this.intl.getRangeLabel;
      this.paginator._intl.changes.next();
    }
  }
}
