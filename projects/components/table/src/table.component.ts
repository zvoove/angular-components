import {
  AfterContentInit,
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
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { IPsTableIntlTexts, PsExceptionMessageExtractor, PsIntlService } from '@prosoft/components/core';
import { PsFlipContainerComponent } from '@prosoft/components/flip-container';
import { combineLatest, Subject, Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';

import { PsTableDataSource } from './data/table-data-source';
import {
  PsTableColumnDirective,
  PsTableCustomHeaderDirective,
  PsTableCustomSettingsDirective,
  PsTableListActionsDirective,
  PsTableRowActionsDirective,
  PsTableRowDetailDirective,
  PsTableTopButtonSectionDirective,
} from './directives/table.directives';
import { PsTableStateManager, PsTableUrlStateManager } from './helper/state-manager';
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
  @Input() public pageDebounce: number;

  @Input()
  @HostBinding('class.mat-elevation-z1')
  public cardLayout = true;

  @HostBinding('class.ps-table--card')
  public get cardLayoutBinding() {
    return this.cardLayout;
  }

  @Input()
  @HostBinding('class.ps-table--striped')
  public striped = false;

  @Input() stateManager: PsTableStateManager = new PsTableUrlStateManager(this.router, this.route);

  @Output() public page = new EventEmitter<PageEvent>();

  @ViewChild(PsFlipContainerComponent, { static: true }) public flipContainer: PsFlipContainerComponent | null = null;

  @ContentChild(PsTableCustomHeaderDirective, { read: TemplateRef, static: false })
  public customHeader: TemplateRef<any> | null = null;

  @ContentChild(PsTableCustomSettingsDirective, { read: TemplateRef, static: false })
  public customSettings: TemplateRef<any> | null = null;

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

  private ngUnsubscribe$ = new Subject<void>();

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

    this.dataSource.locale = this._locale;
    this.pageSizeOptions = this.settingsService.pageSizeOptions;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.intlOverride) {
      this.updateIntl();
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

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
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
    this.stateManager.remove(this.tableId);
    this.flipContainer.showFront();
  }

  public toggleRowDetail(item: any, open?: boolean) {
    if (!this.rowDetail) {
      return;
    }

    this.rowDetail.toggle(item, open);
  }

  private requestUpdate() {
    const updateInfo = this.dataSource.getUpdateDataInfo();
    this.stateManager.requestUpdate(this.tableId, updateInfo);
  }

  private initListSettingsSubscription() {
    const tableSettings$ = this.settingsService.getStream(this.tableId, false);
    const stateSettings$ = this.stateManager.createStateSource(this.tableId);
    this.subscriptions.push(
      combineLatest([stateSettings$, tableSettings$])
        .pipe(
          // guards agains multiple data updates, when multiple emits happen at the same time.
          debounceTime(0)
        )
        .subscribe({
          next: ([urlSettings, tableSettings]) => {
            // Paging, Sorting, Filter und Display Columns updaten
            this.updateTableState(tableSettings, urlSettings);

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

            this.dataSource.tableReady = true;
            this.dataSource.updateData(false);
            this.cd.markForCheck();
          },
          error: (err: Error | any) => {
            this.dataSource.error = err;
          },
        })
    );
  }

  private updateTableState(tableSettings: Partial<IPsTableSetting>, urlSettings: Partial<IPsTableUpdateDataInfo>) {
    tableSettings = tableSettings || {};
    urlSettings = urlSettings || {};

    this.pageIndex = Math.max(urlSettings.currentPage || 0, 0);
    this.pageSize = Math.max(urlSettings.pageSize || tableSettings.pageSize || 15, 1);
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
  }
}
