/* eslint-disable @typescript-eslint/no-unused-vars */
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injectable, LOCALE_ID, QueryList, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IconType, MatIconHarness, MatIconTestingModule } from '@angular/material/icon/testing';
import { MatMenuItemHarness } from '@angular/material/menu/testing';
import { MatSortHarness } from '@angular/material/sort/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ParamMap, Params, Router, RouterLink, Routes, convertToParamMap, provideRouter } from '@angular/router';
import { filterAsync } from '@zvoove/components/utils/src/array';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { ZvTableDataSource } from './data/table-data-source';
import { ZvTableColumn } from './directives/table.directives';
import { ZvTableMemoryStateManager } from './helper/state-manager';
import { IZvTableSortDefinition, ZvTableActionScope } from './models';
import { IZvTableSetting, ZvTableSettingsService } from './services/table-settings.service';
import { ZvTablePaginationComponent } from './subcomponents/table-pagination.component';
import { ZvTable } from './table.component';
import { ZvTableModule } from './table.module';
import { ZvTableHarness } from './testing/table.harness';
import { ZvExceptionMessageExtractor } from '@zvoove/components/core';

@Injectable()
class TestSettingsService extends ZvTableSettingsService {
  public settings$ = new BehaviorSubject<Record<string, IZvTableSetting>>({});
  public override pageSizeOptions = [1, 5, 25, 50];
  public override settingsEnabled = false;

  public override getStream(tableId: string, _: boolean): Observable<IZvTableSetting> {
    return this.settings$.pipe(map((settings) => settings[tableId]));
  }

  public override save(id: string, settings: IZvTableSetting): Observable<void> {
    const currentSettings = this.settings$.getValue();
    currentSettings[id] = settings;
    this.settings$.next(currentSettings);

    return of();
  }
}

const router: any = {
  navigate: (_route: any, options: any) => {
    queryParams$.next(convertToParamMap(options.queryParams));
  },
};

const queryParams$ = new BehaviorSubject<ParamMap>(convertToParamMap({ other: 'value' }));

const route: ActivatedRoute = {
  snapshot: new Proxy(queryParams$, {
    get: (obj, prop) => {
      if (prop === 'queryParamMap') {
        return obj.value;
      }
      return null;
    },
  }),
  queryParamMap: queryParams$,
} as any;

function createColDef(data: { property?: string; header?: string; sortable?: boolean }) {
  const colDef = new ZvTableColumn();
  colDef.sortable = data.sortable || false;
  colDef.property = data.property || null;
  colDef.header = data.header || null;
  return colDef;
}

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-table
      #table
      [caption]="caption"
      [dataSource]="dataSource"
      [tableId]="tableId"
      [refreshable]="refreshable"
      [filterable]="filterable"
      [showSettings]="showSettings"
      [layout]="layout"
      [striped]="striped"
      [sortDefinitions]="sortDefinitions"
      [stateManager]="stateManager"
      [preferSortDropdown]="preferSortDropdown"
      (page)="onPage($event)"
    >
      <zv-table-column [header]="'id'" property="id" [sortable]="true"></zv-table-column>
      <zv-table-column
        [header]="'string'"
        property="str"
        [sortable]="false"
        [headerStyles]="{ color: 'green' }"
        [columnStyles]="{ color: 'blue' }"
      ></zv-table-column>
      <zv-table-column property="__virtual" [mandatory]="true" [width]="'100px'">
        <ng-container *zvTableColumnHeaderTemplate>
          <i>custom</i>
        </ng-container>
        <ng-container *zvTableColumnTemplate="let item"> custom {{ item.id }} </ng-container>
      </zv-table-column>

      <zv-table-column [sortable]="false" property="__custom" [width]="'100px'">
        <ng-container *zvTableColumnTemplate="let item">
          <button (click)="table.toggleRowDetail(item)">customToggle</button>
        </ng-container>
      </zv-table-column>

      <div *zvTableCustomHeader>custom header</div>

      <div *zvTableCustomSettings="let settings">custom settings {{ settings.pageSize }}</div>

      <div *zvTableTopButtonSection>custom button section</div>

      <zv-table-row-detail [expanded]="expanded" [showToggleColumn]="showToggleColumn">
        <ng-container *zvTableRowDetailTemplate="let item">item: {{ item.id }}</ng-container>
      </zv-table-row-detail>
    </zv-table>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [MatIconTestingModule, ZvTableModule],
})
export class TestComponent {
  public caption = 'title';
  public dataSource: ZvTableDataSource<any>;
  public tableId = 'tableId';
  public refreshable = true;
  public filterable = true;
  public showSettings = true;
  public layout: 'card' | 'border' | 'flat' = 'card';
  public striped = true;
  public sortDefinitions: IZvTableSortDefinition[] = [{ prop: '__customSort', displayName: 'Custom Sort' }];
  public preferSortDropdown = true;

  /** Karma doesn't recognize url changes from code. */
  public stateManager = new ZvTableMemoryStateManager();

  public expanded = false;
  public showToggleColumn = true;

  @ViewChild(ZvTable, { static: true }) table: ZvTable;
  @ViewChild(ZvTablePaginationComponent, { static: true }) paginator: ZvTablePaginationComponent;

  public onPage(_event: unknown) {}
  public onListActionExecute(_selection: unknown[]) {}
}

describe('ZvTable', () => {
  describe('isolated', () => {
    const cd = { markForCheck: () => {} } as ChangeDetectorRef;

    let settingsService: TestSettingsService;
    function createTableInstance(hooks = false): ZvTable {
      settingsService = new TestSettingsService();
      TestBed.configureTestingModule({
        providers: [
          { provide: ZvTable, useClass: ZvTable },
          { provide: ChangeDetectorRef, useValue: cd },
          { provide: ActivatedRoute, useValue: route },
          { provide: Router, useValue: router },
          { provide: LOCALE_ID, useValue: 'de' },
          { provide: ZvTableSettingsService, useValue: settingsService },
          { provide: ZvExceptionMessageExtractor, useValue: null },
        ],
      });
      const table = TestBed.inject(ZvTable);
      table.tableId = 'tableid';
      table.dataSource = new ZvTableDataSource(() => of([{ a: 'asdfg' }, { a: 'gasdf' }, { a: 'asdas' }, { a: '32424rw' }]));
      if (hooks) {
        table.ngOnChanges({});
        table.ngOnInit();
        table.ngAfterContentInit();
      }
      return table;
    }

    beforeEach(() => {
      queryParams$.next(convertToParamMap({ other: 'value' }));
    });

    it('should update table state from the settings service and the query params', fakeAsync(() => {
      const table = createTableInstance();
      settingsService.settings$.next({});
      spyOn(settingsService, 'getStream').and.callThrough();
      table.columnDefs = [createColDef({ property: 'prop1' }), createColDef({ property: 'prop2' })];
      table.rowDetail = { showToggleColumn: true } as any;
      table.dataSource.listActions.push({ icon: 'add', label: 'Add', scope: ZvTableActionScope.list });
      table.dataSource.rowActions.push({ icon: 'add', label: 'Add', scope: ZvTableActionScope.row });

      table.ngOnInit();
      table.ngAfterContentInit();
      tick(1);

      expect(table.pageSize).toEqual(15);
      expect(table.pageIndex).toEqual(0);
      expect(table.filterText).toEqual('');
      expect(table.sortColumn).toEqual(null);
      expect(table.sortDirection).toEqual('asc');
      expect(table.displayedColumns).toEqual(['select', 'rowDetailExpander', 'prop1', 'prop2', 'options']);
      expect(settingsService.getStream).toHaveBeenCalledWith(table.tableId, false);

      settingsService.settings$.next({
        tableid: {
          columnBlacklist: ['prop2'],
          pageSize: 22,
          sortColumn: 'col',
          sortDirection: 'desc',
        } as IZvTableSetting,
      });
      tick(1);

      expect(table.pageSize).toEqual(22);
      expect(table.pageIndex).toEqual(0);
      expect(table.filterText).toEqual('');
      expect(table.sortColumn).toEqual('col');
      expect(table.sortDirection).toEqual('desc');
      expect(table.displayedColumns).toEqual(['select', 'rowDetailExpander', 'prop1', 'options']);

      queryParams$.next(
        convertToParamMap({
          tableid: '1◬1◬asdf◬Column1◬asc',
        } as Params)
      );
      tick(1);

      expect(table.pageSize).toEqual(1);
      expect(table.pageIndex).toEqual(1);
      expect(table.filterText).toEqual('asdf');
      expect(table.sortColumn).toEqual('Column1');
      expect(table.sortDirection).toEqual('asc');
      expect(table.displayedColumns).toEqual(['select', 'rowDetailExpander', 'prop1', 'options']);

      table.rowDetail = { showToggleColumn: false } as any;
      queryParams$.next(convertToParamMap({ tableid: '1◬1◬asdf◬Column1◬desc' } as Params));
      tick(1);
      expect(table.displayedColumns).toEqual(['select', 'prop1', 'options']);

      table.rowDetail = null;
      queryParams$.next(convertToParamMap({ tableid: '1◬2◬asdf◬Column1◬desc' } as Params));
      tick(1);
      expect(table.displayedColumns).toEqual(['select', 'prop1', 'options']);

      table.dataSource.listActions.length = 0;
      queryParams$.next(convertToParamMap({ tableid: '1◬3◬asdf◬Column1◬desc' } as Params));
      tick(1);
      expect(table.displayedColumns).toEqual(['prop1', 'options']);

      table.dataSource.rowActions.length = 0;
      table.showSettings = false;
      table.refreshable = false;
      queryParams$.next(convertToParamMap({ tableid: '1◬4◬asdf◬Column1◬desc' } as Params));
      tick(1);
      expect(table.displayedColumns).toEqual(['prop1']);
    }));

    it('should initialize page size options from the service', fakeAsync(() => {
      const table = createTableInstance();
      settingsService.pageSizeOptions = [3, 7, 9];
      table.ngOnInit();
      expect(table.pageSizeOptions).toBe(settingsService.pageSizeOptions);
    }));

    it('should show right content depending on the datatable state', fakeAsync(() => {
      const table = createTableInstance();

      table.dataSource = { loading: false, error: null, visibleRows: [] } as any;
      expect(table.showNoEntriesText).toBe(true);
      expect(table.showError).toBe(false);
      expect(table.showLoading).toBe(false);

      table.dataSource = { loading: true, error: null, visibleRows: [] } as any;
      expect(table.showNoEntriesText).toBe(false);
      expect(table.showError).toBe(false);
      expect(table.showLoading).toBe(true);

      table.dataSource = { loading: false, error: new Error('error'), visibleRows: [] } as any;
      expect(table.showNoEntriesText).toBe(false);
      expect(table.showError).toBe(true);
      expect(table.showLoading).toBe(false);
    }));

    it('should only enable settings if all prerequisites are met', fakeAsync(() => {
      const table = createTableInstance();

      table.tableId = 'test';
      table.showSettings = true;
      settingsService.settingsEnabled = true;
      expect(table.settingsEnabled).toBe(true);

      settingsService.settingsEnabled = false;
      expect(table.settingsEnabled).toBe(false);
      settingsService.settingsEnabled = true;

      table.showSettings = false;
      expect(table.settingsEnabled).toBe(false);
      table.showSettings = true;

      table.tableId = null;
      expect(table.settingsEnabled).toBe(false);
    }));

    it('should only show list actions if there are any menu items', fakeAsync(() => {
      const table = createTableInstance();
      table.tableId = 'test';
      table.showSettings = true;
      settingsService.settingsEnabled = true;

      table.refreshable = false;
      expect(table.showListActions).toBe(true);

      table.showSettings = false;
      expect(table.showListActions).toBe(false);

      table.refreshable = true;
      expect(table.showListActions).toBe(true);
      table.refreshable = false;
    }));

    it('should merge sort definitions and only show sort dropdown when there are custom definitions when preferSortDropdown input is false', fakeAsync(() => {
      const table = createTableInstance();
      table.preferSortDropdown = false;
      const customSortDef = { prop: 'custom', displayName: 'Custom' };
      const notSortableColDef = new ZvTableColumn();
      notSortableColDef.sortable = false;
      notSortableColDef.property = 'no_sort';
      notSortableColDef.header = 'NoSort';
      const sortableColDef = new ZvTableColumn();
      sortableColDef.sortable = true;
      sortableColDef.property = 'sort';
      sortableColDef.header = 'Sort';
      const colDefs = new QueryList<ZvTableColumn>();

      // nothing to sort
      colDefs.reset([notSortableColDef]);
      table.columnDefsSetter = colDefs;
      table.sortDefinitions = [];
      expect(table.useSortDropdown).toBe(false);
      expect(table.showDropdownSorting).toBe(false);
      expect(table.sortDefinitions).toEqual([]);

      // only things sortable in the header
      colDefs.reset([notSortableColDef, sortableColDef]);
      table.columnDefsSetter = colDefs;
      expect(table.useSortDropdown).toBe(false);
      expect(table.showDropdownSorting).toBe(false);
      expect(table.sortDefinitions).toEqual([{ prop: 'sort', displayName: 'Sort' }]);

      // sortable column defs and custom sorting rules
      table.sortDefinitions = [{ prop: 'custom', displayName: 'Custom' }];
      expect(table.useSortDropdown).toBe(true);
      expect(table.showDropdownSorting).toBe(true);
      expect(table.sortDefinitions).toEqual([customSortDef, { prop: 'sort', displayName: 'Sort' }]);

      // no column defs, but custom sorting rules
      colDefs.reset([]);
      table.columnDefsSetter = colDefs;
      expect(table.useSortDropdown).toBe(true);
      expect(table.showDropdownSorting).toBe(true);
      expect(table.sortDefinitions).toEqual([customSortDef]);

      // no column defs, no custom sorting rules
      table.sortDefinitions = null;
      expect(table.useSortDropdown).toBe(false);
      expect(table.showDropdownSorting).toBe(false);
      expect(table.sortDefinitions).toEqual([]);
    }));

    it('should always show sort dropdown when preferSortDropdown input is true and there are things to sort', fakeAsync(() => {
      const table = createTableInstance();
      table.preferSortDropdown = true;
      const customSortDef = { prop: 'custom', displayName: 'Custom' };
      const notSortableColDef = new ZvTableColumn();
      notSortableColDef.sortable = false;
      notSortableColDef.property = 'no_sort';
      notSortableColDef.header = 'NoSort';
      const sortableColDef = new ZvTableColumn();
      sortableColDef.sortable = true;
      sortableColDef.property = 'sort';
      sortableColDef.header = 'Sort';
      const colDefs = new QueryList<ZvTableColumn>();

      // nothing to sort
      colDefs.reset([notSortableColDef]);
      table.columnDefsSetter = colDefs;
      table.sortDefinitions = [];
      expect(table.useSortDropdown).toBe(true);
      expect(table.showDropdownSorting).toBe(false);

      // only things sortable in the header
      colDefs.reset([notSortableColDef, sortableColDef]);
      table.columnDefsSetter = colDefs;
      expect(table.useSortDropdown).toBe(true);
      expect(table.showDropdownSorting).toBe(true);
      expect(table.sortDefinitions).toEqual([{ prop: 'sort', displayName: 'Sort' }]);

      // sortable column defs and custom sorting rules
      table.sortDefinitions = [{ prop: 'custom', displayName: 'Custom' }];
      expect(table.useSortDropdown).toBe(true);
      expect(table.showDropdownSorting).toBe(true);
      expect(table.sortDefinitions).toEqual([customSortDef, { prop: 'sort', displayName: 'Sort' }]);

      // no column defs, but custom sorting rules
      colDefs.reset([]);
      table.columnDefsSetter = colDefs;
      expect(table.useSortDropdown).toBe(true);
      expect(table.showDropdownSorting).toBe(true);
      expect(table.sortDefinitions).toEqual([customSortDef]);

      // no column defs, no custom sorting rules
      table.sortDefinitions = null;
      expect(table.useSortDropdown).toBe(true);
      expect(table.showDropdownSorting).toBe(false);
      expect(table.sortDefinitions).toEqual([]);
    }));

    it('requestUpdate should update query params without overriding deleting other query params', () => {
      queryParams$.next(convertToParamMap({ existingParam: '0815' }));
      spyOn(router, 'navigate');

      const table = createTableInstance();
      table.pageIndex = 3;
      table.pageSize = 12;
      table.filterText = 'Blubb';
      table.sortColumn = 'col';
      table.sortDirection = 'desc';
      table.tableId = 'requestUpdate';

      (table as any).requestUpdate();

      const expectedQueryParams = {
        existingParam: '0815',
        requestUpdate: '12◬3◬Blubb◬col◬desc',
      };

      expect(router.navigate).toHaveBeenCalledWith([], { queryParams: expectedQueryParams, relativeTo: route });
    });

    it('should set locale on the data source', fakeAsync(() => {
      const initialDataSource = new ZvTableDataSource(() => of([]), 'client');
      spyOn(initialDataSource, 'updateData');
      const newDataSource = new ZvTableDataSource(() => of([]), 'client');
      spyOn(newDataSource, 'updateData');

      const table = createTableInstance();
      table.dataSource = initialDataSource;
      table.ngOnInit();
      table.ngAfterContentInit();

      tick(1);

      expect(initialDataSource.locale).toBe('de');
    }));

    it('should update state when sort changes', fakeAsync(() => {
      const table = createTableInstance(true);
      spyOn(table as any, 'requestUpdate').and.callThrough();
      table.onSortChanged({ sortColumn: 'col', sortDirection: 'desc' });
      expect((table as any).requestUpdate).toHaveBeenCalledTimes(1);
      tick(1);
      expect(table.sortColumn).toEqual('col');
      expect(table.sortDirection).toEqual('desc');
    }));

    it('should update state when filter changes', fakeAsync(() => {
      const table = createTableInstance(true);
      spyOn(table as any, 'requestUpdate').and.callThrough();
      table.onSearchChanged('test');
      expect((table as any).requestUpdate).toHaveBeenCalledTimes(1);
      tick(1);
      expect(table.filterText).toEqual('test');
    }));

    it('should update state when page changes and emit output', fakeAsync(() => {
      const table = createTableInstance(true);
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      spyOn(table.page, 'emit');
      spyOn(table as any, 'requestUpdate').and.callThrough();
      table.onPage({ pageIndex: 5, pageSize: 3, length: 20, previousPageIndex: 4 });
      expect((table as any).requestUpdate).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      expect(table.page.emit).toHaveBeenCalledTimes(1);
      tick(1);
      expect(table.pageIndex).toEqual(5);
      expect(table.pageSize).toEqual(3);
    }));

    it('should delete own query params and flip to front when settings are saved', fakeAsync(() => {
      queryParams$.next(convertToParamMap({ existingParam: '0815', tableId: '12◬3◬Blubb◬col◬desc' }));
      spyOn(router, 'navigate');

      const table = createTableInstance();
      table.tableId = 'tableId';
      table.flipContainer = { showFront: () => {} } as any;
      spyOn(table.flipContainer, 'showFront');

      table.onSettingsSaved();

      expect(table.flipContainer.showFront).toHaveBeenCalledTimes(1);
      const expectedQueryParams = {
        existingParam: '0815',
      };
      expect(router.navigate).toHaveBeenCalledWith([], { queryParams: expectedQueryParams, relativeTo: route });
      tick(1);
    }));

    it('should update view when view/content children change', fakeAsync(() => {
      spyOn(cd, 'markForCheck');
      const table = createTableInstance();
      spyOn(table as any, 'updateTableState').and.callThrough();

      table.customHeader = null;
      expect(cd.markForCheck).toHaveBeenCalledTimes(1);

      table.customSettings = null;
      expect(cd.markForCheck).toHaveBeenCalledTimes(2);

      table.topButtonSection = null;
      expect(cd.markForCheck).toHaveBeenCalledTimes(3);

      table.columnDefsSetter = new QueryList();
      expect((table as any).updateTableState).toHaveBeenCalledTimes(1);
      expect(cd.markForCheck).toHaveBeenCalledTimes(4);

      table.rowDetail = null;
      expect((table as any).updateTableState).toHaveBeenCalledTimes(2);
      expect(cd.markForCheck).toHaveBeenCalledTimes(5);
    }));
  });

  describe('intgration', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;
    let loader: HarnessLoader;
    let table: ZvTableHarness;

    async function initTestComponent(tableDataSource: ZvTableDataSource<any>) {
      fixture = TestBed.createComponent(TestComponent);
      component = fixture.componentInstance;
      expect(component).toBeDefined();
      component.dataSource = tableDataSource;
      loader = TestbedHarnessEnvironment.loader(fixture);
      table = await loader.getHarness(ZvTableHarness);
    }

    beforeEach(async () => {
      const routes: Routes = [
        {
          path: '',
          component: TestComponent,
        },
        {
          path: 'path',
          children: [
            {
              path: 'to',
              children: [
                {
                  path: 'something',
                  children: [
                    {
                      path: ':id',
                      component: TestComponent,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      await TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, CommonModule, ZvTableModule, MatIconTestingModule, TestComponent],
        providers: [
          provideRouter(routes),
          { provide: ZvTableSettingsService, useClass: TestSettingsService },
          { provide: MatPaginatorIntl, useClass: MatPaginatorIntl },
        ],
      }).compileComponents();

      await initTestComponent(
        new ZvTableDataSource({
          loadDataFn: () =>
            of([
              { id: 1, str: 'item 1' },
              { id: 2, str: 'item 2' },
              { id: 3, str: 'item 3' },
            ]),
          mode: 'client',
          actions: [
            { icon: 'add', label: 'custom list actions', scope: ZvTableActionScope.list, actionFn: () => {} },
            { icon: 'add', label: 'custom row actions', scope: ZvTableActionScope.row, actionFn: () => {} },
          ],
        })
      );
    });

    describe('should bind the right properties and events to the ui', () => {
      beforeEach(async () => {
        await initTestComponent(
          new ZvTableDataSource({
            loadDataFn: () =>
              of([
                { id: 1, str: 'item 1' },
                { id: 2, str: 'item 2' },
                { id: 3, str: 'item 3' },
              ]),
            mode: 'client',
            actions: [
              {
                label: 'custom action',
                icon: 'check',
                scope: ZvTableActionScope.all,
                actionFn: (selection) => component.onListActionExecute(selection),
              },
            ],
          })
        );

        component.table._settingsService.settingsEnabled = true;
        (component.table._settingsService as TestSettingsService).settings$.next({
          [component.tableId]: {
            pageSize: 2,
            sortColumn: null,
            sortDirection: null,
            columnBlacklist: [],
          },
        });
      });

      it('should bind caption', async () => {
        expect(await table.getCaption()).toEqual('title');
        component.caption = 'foo';
        expect(await table.getCaption()).toEqual('foo');
      });

      it('should set layout', async () => {
        expect(await table.getIsLayout('card')).toBeTruthy();

        component.table.layout = 'border';
        expect(await table.getIsLayout('border')).toBeTruthy();

        component.table.layout = 'flat';
        expect(await table.getIsLayout('flat')).toBeTruthy();
      });

      it('should set striped', async () => {
        expect(await table.getIsStriped()).toBeTruthy();
        component.striped = false;
        expect(await table.getIsStriped()).toBeFalsy();
      });

      it('should set custom header', async () => {
        const customContent = await table.getCustomHeaderContent();
        expect(customContent.length).toEqual(1);
        expect(await customContent[0].text()).toEqual('custom header');
      });

      it('should set top buttons', async () => {
        const topButtonSectionContent = await table.getTopButtonSectionContent();
        expect(topButtonSectionContent.length).toEqual(1);
        expect(await topButtonSectionContent[0].text()).toEqual('custom button section');
      });

      it('should create header rows', async () => {
        const headerRows = await table.getHeaderRows();
        expect(headerRows.length).toEqual(1);

        const strHeaderCells = await headerRows[0].getCells({ columnName: 'str' });
        expect(strHeaderCells.length).toEqual(1);
        expect(await (await strHeaderCells[0].host()).getCssValue('color')).toEqual('rgb(0, 128, 0)');
        expect(await strHeaderCells[0].getText()).toEqual('string');

        const customHeaderCells = await headerRows[0].getCells({ columnName: '__virtual' });
        expect(customHeaderCells.length).toEqual(1);
        expect(await customHeaderCells[0].getText()).toEqual('custom');
      });

      it('should create data rows', async () => {
        const dataRows = await table.getRows();
        expect(dataRows.length).toEqual(6); // 3 rows with 3x row detail per row

        const data = await filterAsync(dataRows, async (row) => await (await row.host()).hasClass('zv-table-data__row'));

        expect(data.length).toEqual(3);

        const strDataCell = await data[0].getCells({ columnName: 'str' });
        expect(strDataCell.length).toEqual(1);
        expect(await strDataCell[0].getText()).toEqual('item 1');
        expect(await (await strDataCell[0].host()).getCssValue('color')).toEqual('rgb(0, 0, 255)');

        const detail = await filterAsync(dataRows, async (row) => await (await row.host()).hasClass('zv-table-data__detail-row'));

        expect(detail.every(async (d) => (await (await d.host()).getCssValue('height')) === '0')).toEqual(true);

        const expanderCell = await data[0].getCells({ columnName: 'rowDetailExpander' });
        expect(expanderCell.length).toEqual(1);

        await (await expanderCell[0].host()).click();
        expect(await (await detail[0].host()).getCssValue('height')).not.toEqual('0');

        const customExpanderCell = await data[0].getCells({ columnName: '__custom' });
        expect(customExpanderCell.length).toEqual(1);

        await (await customExpanderCell[0].host()).click();
        expect(detail.every(async (d) => (await (await d.host()).getCssValue('height')) === '0')).toEqual(true);
      });

      it('should filter', async () => {
        const searchInput = await table.getSearchInput();
        expect(await searchInput.getValue()).toEqual('');

        spyOn(component.table, 'onSearchChanged');
        await searchInput.setValue('asdf');
        expect(component.table.onSearchChanged).toHaveBeenCalledTimes(1);
        expect(component.table.onSearchChanged).toHaveBeenCalledWith('asdf');
      });

      it('should sort via dropdown', async () => {
        const sort = await loader.getHarness(MatSortHarness);
        expect(await sort.getActiveHeader()).toBeFalsy();

        const sortSelect = await table.getSortSelect();
        expect(await sortSelect.getValueText()).toEqual('');

        await sortSelect.open();
        const optionTexts = await Promise.all((await sortSelect.getOptions()).map(async (o) => await o.getText()));
        expect(optionTexts).toEqual(['', 'Custom Sort', 'id']);

        spyOn(component.table, 'onSortChanged');
        await sortSelect.clickOptions({ text: 'id' });
        expect(component.table.onSortChanged).toHaveBeenCalledWith({
          sortColumn: 'id',
          sortDirection: 'asc',
        });

        const sortDirectionButtons = await table.getSortDirectionButtons();
        expect(sortDirectionButtons.length).toEqual(2);
        await sortDirectionButtons[0].click();
        expect(component.table.onSortChanged).toHaveBeenCalledWith({
          sortColumn: 'id',
          sortDirection: 'desc',
        });
        expect(await sort.getActiveHeader()).toBeFalsy();
      });

      it('should sort via header', async () => {
        component.preferSortDropdown = false;
        component.sortDefinitions = [];
        fixture.detectChanges();

        const sort = await loader.getHarness(MatSortHarness);
        expect(await sort.getActiveHeader()).toBeFalsy();

        expect(await table.getSortSelect()).toBeFalsy();

        const idSortHeader = (await sort.getSortHeaders({ label: 'id' }))[0];

        spyOn(component.table, 'onSortChanged');
        await idSortHeader.click();
        let activeHeader = await sort.getActiveHeader();
        expect(await activeHeader.getLabel()).toEqual('id');
        expect(await activeHeader.getSortDirection()).toEqual('asc');
        expect(component.table.onSortChanged).toHaveBeenCalledWith({
          sortColumn: 'id',
          sortDirection: 'asc',
        });

        await idSortHeader.click();
        activeHeader = await sort.getActiveHeader();
        expect(await activeHeader.getLabel()).toEqual('id');
        expect(await activeHeader.getSortDirection()).toEqual('desc');
        expect(component.table.onSortChanged).toHaveBeenCalledWith({
          sortColumn: 'id',
          sortDirection: 'desc',
        });

        await idSortHeader.click();
        activeHeader = await sort.getActiveHeader();
        expect(await activeHeader.getLabel()).toEqual('id');
        expect(await activeHeader.getSortDirection()).toEqual('asc');
        expect(component.table.onSortChanged).toHaveBeenCalledWith({
          sortColumn: 'id',
          sortDirection: 'asc',
        });

        expect(await table.getSortSelect()).toBeFalsy();
      });

      it('should refresh', async () => {
        const listActionsMenu = await table.getListActionsButton();
        await listActionsMenu.open();
        const listActions = await listActionsMenu.getItems();
        expect(listActions.length).toEqual(3);

        spyOn(component.table.dataSource, 'updateData');
        await listActionsMenu.clickItem({ text: 'refresh Refresh list' });
        expect(component.table.dataSource.updateData).toHaveBeenCalled();
      });

      it('should hide refresh button', async () => {
        component.refreshable = false;

        const listActionsMenu = await table.getListActionsButton();
        await listActionsMenu.open();
        const listActions = await listActionsMenu.getItems();
        expect(listActions.length).toEqual(2);
        expect(await listActions[0].getText()).toEqual('check custom action');
        expect(await listActions[1].getText()).toEqual('settings List settings');
      });

      it('should flip to settings', async () => {
        const listActionsMenu = await table.getListActionsButton();
        await listActionsMenu.open();
        const listActions = await listActionsMenu.getItems();
        expect(listActions.length).toEqual(3);

        expect(await table.getSettingsHarness()).toBeNull();
        await listActionsMenu.clickItem({ text: 'settings List settings' });
        expect(await table.getSettingsHarness()).toBeDefined();
      });

      it('should hide settings button', async () => {
        component.showSettings = false;

        const listActionsMenu = await table.getListActionsButton();
        await listActionsMenu.open();
        const listActions = await listActionsMenu.getItems();
        expect(listActions.length).toEqual(2);
        expect(await listActions[0].getText()).toEqual('check custom action');
        expect(await listActions[1].getText()).toEqual('refresh Refresh list');
      });

      it('should call customListAction', async () => {
        const checkboxes = await table.getSelectCheckboxes();
        await checkboxes[1].check();

        const listActionsMenu = await table.getListActionsButton();
        await listActionsMenu.open();
        spyOn(component, 'onListActionExecute');
        await listActionsMenu.clickItem({ text: 'check custom action' });
        expect(component.onListActionExecute).toHaveBeenCalledWith([{ id: 1, str: 'item 1' }]);
      });

      it('should call customRowAction', async () => {
        const actions = await table.getRowActions(0);
        spyOn(component, 'onListActionExecute');
        const actionsButtons = await actions.getActionButtons();
        await actionsButtons[0].click();
        expect(component.onListActionExecute).toHaveBeenCalledWith([{ id: 1, str: 'item 1' }]);
      });
    });

    it('should show "GoToPage"-Select, if there are more then 2 pages', async () => {
      await initTestComponent(
        new ZvTableDataSource({
          loadDataFn: () => of(Array.from({ length: 50 }, (_, i: number) => ({ id: i, str: `item ${i}` }))),
          mode: 'client',
        })
      );

      const gotoPageSelect = await table.getGotoPageSelect();
      await gotoPageSelect.open();
      expect((await gotoPageSelect.getOptions()).length).toEqual(4);
    });

    it('should not show "GoToPage"-Select, if there are less then 3 pages', async () => {
      await initTestComponent(
        new ZvTableDataSource({
          loadDataFn: () => of(Array.from({ length: 5 }, (_, i: number) => ({ id: i, str: `item ${i}` }))),
          mode: 'client',
        })
      );

      const gotoPageSelect = await table.getGotoPageSelect();
      expect(gotoPageSelect).toBeNull();
    });

    it('should go to selected page chosen with "GoToPage"-Select', async () => {
      await initTestComponent(
        new ZvTableDataSource({
          loadDataFn: () => of(Array.from({ length: 50 }, (_, i: number) => ({ id: i, str: `item ${i}` }))),
          mode: 'client',
        })
      );

      component.table.pageDebounce = 0;

      const gotoPageSelect = await table.getGotoPageSelect();
      await gotoPageSelect.open();
      await gotoPageSelect.clickOptions({ text: '2' });

      const firstRowSecondPage = (await table.getRows())[0];
      expect(await (await firstRowSecondPage.getCells({ columnName: 'str' }))[0].getText()).toEqual('item 15');
    });

    describe('table actions', () => {
      beforeEach(async () => {
        await initTestComponent(
          new ZvTableDataSource({
            loadDataFn: () =>
              of([
                { id: 1, str: 'item 1' },
                { id: 2, str: 'item 2' },
                { id: 3, str: 'item 3' },
              ]),
            mode: 'client',
            actions: [
              {
                label: 'custom all action 1',
                icon: 'check',
                scope: ZvTableActionScope.all,
                children: [
                  {
                    label: 'custom all subaction 1',
                    icon: 'check',
                    scope: ZvTableActionScope.row,
                  },
                  {
                    label: 'custom all subaction 2',
                    icon: 'angular',
                    isSvgIcon: true,
                    scope: ZvTableActionScope.row,
                  },
                ],
              },
              {
                label: 'custom all action 2',
                icon: 'angular',
                isSvgIcon: true,
                scope: ZvTableActionScope.all,
                isHiddenFn: (items: any[]) => !items.length,
                routerLink: (items: any[]) => ({
                  path: ['/', 'path', 'to', 'something', items[0].id],
                  queryParams: { a: items[0].str.replace(' ', '_') },
                }),
              },
              {
                label: 'custom all action 3',
                icon: 'cancel',
                scope: ZvTableActionScope.all,
                children: [
                  {
                    label: 'custom all action 3 subaction 1',
                    icon: '',
                    scope: ZvTableActionScope.all,
                  },
                  {
                    label: 'custom all action 3 subaction 2',
                    icon: '',
                    scope: ZvTableActionScope.all,
                  },
                ],
              },
              {
                label: 'custom all action some children hidden',
                icon: 'cancel',
                scope: ZvTableActionScope.all,
                children: [
                  {
                    label: 'hidden',
                    icon: 'check',
                    isHiddenFn: () => true,
                    scope: ZvTableActionScope.all,
                  },
                  {
                    label: 'visible',
                    icon: 'check',
                    scope: ZvTableActionScope.all,
                  },
                ],
              },
              {
                label: 'custom all action all children hidden',
                icon: 'cancel',
                scope: ZvTableActionScope.all,
                children: [
                  {
                    label: 'hidden',
                    icon: 'check',
                    isHiddenFn: () => true,
                    scope: ZvTableActionScope.all,
                  },
                ],
              },
              {
                label: 'custom list action 1',
                icon: 'check',
                scope: ZvTableActionScope.list,
              },
              {
                label: 'custom list action 2',
                icon: 'angular',
                isSvgIcon: true,
                scope: ZvTableActionScope.list,
              },
              {
                label: 'custom row action 1',
                icon: 'check',
                scope: ZvTableActionScope.row,
              },
              {
                label: 'custom row action 2',
                icon: 'angular',
                isSvgIcon: true,
                scope: ZvTableActionScope.row,
              },
            ],
          })
        );

        component.filterable = false;
        component.refreshable = false;
        component.showSettings = false;
      });

      it('routerlink should work', async () => {
        const selectBoxes = await table.getSelectCheckboxes();
        expect(selectBoxes.length).toBeTruthy();
        await selectBoxes[1].check();

        const listActionsMenu = await table.getListActionsButton();
        await listActionsMenu.open();
        const listActions = await listActionsMenu.getItems();
        expect(listActions.length).toEqual(6);

        const links = fixture.debugElement.queryAll(By.directive(RouterLink));
        expect(links).toBeTruthy();
        expect(links[0].attributes.href).toEqual('/path/to/something/1?a=item_1');
      });

      it('svg icons and isHiddenFn should work', async () => {
        const selectBoxes = await table.getSelectCheckboxes();
        expect(selectBoxes.length).toBeTruthy();
        await selectBoxes[1].check();

        // List-Actions
        const listActionsMenu = await table.getListActionsButton();
        await listActionsMenu.open();
        const listActions = await listActionsMenu.getItems();
        expect(listActions.length).toEqual(6);

        // List-Actions - 1. Level
        await checkAction$(listActions[0], 'custom all action 1', 'check', IconType.FONT);
        await checkAction$(listActions[1], 'custom all action 2', 'angular', IconType.SVG);
        await checkAction$(listActions[2], 'custom all action 3', 'cancel', IconType.FONT);
        await checkAction$(listActions[3], 'custom all action some children hidden', 'cancel', IconType.FONT);
        await checkAction$(listActions[4], 'custom list action 1', 'check', IconType.FONT);
        await checkAction$(listActions[5], 'custom list action 2', 'angular', IconType.SVG);

        // List-Actions - 2. Level
        {
          expect(await listActions[0].hasSubmenu()).toBeTrue();
          const subListActionsMenu = await listActions[0].getSubmenu();
          expect(subListActionsMenu).toBeTruthy();
          await subListActionsMenu.open();
          const subListActions = await subListActionsMenu.getItems();
          expect(subListActions.length).toEqual(2);
          await checkAction$(subListActions[0], 'custom all subaction 1', 'check', IconType.FONT);
          await checkAction$(subListActions[1], 'custom all subaction 2', 'angular', IconType.SVG);
        }

        // List-Actions - 2. Level - partially hidden
        {
          expect(await listActions[3].hasSubmenu()).toBeTrue();
          const subListActionsMenu = await listActions[3].getSubmenu();
          expect(subListActionsMenu).toBeTruthy();
          await subListActionsMenu.open();
          const subListActions = await subListActionsMenu.getItems();
          expect(subListActions.length).toEqual(1);
          await checkAction$(subListActions[0], 'visible', 'check', IconType.FONT);
        }

        // Row-Actions
        const rowActionsMenu = await table.getRowActionsButton(1);
        await rowActionsMenu.open();
        const rowActions = await rowActionsMenu.getItems();
        expect(rowActions.length).toEqual(6);

        // Row-Actions - 1. Level
        await checkAction$(rowActions[0], 'custom all action 1', 'check', IconType.FONT);
        await checkAction$(rowActions[1], 'custom all action 2', 'angular', IconType.SVG);
        await checkAction$(rowActions[2], 'custom all action 3', 'cancel', IconType.FONT);
        await checkAction$(rowActions[3], 'custom all action some children hidden', 'cancel', IconType.FONT);
        await checkAction$(rowActions[4], 'custom row action 1', 'check', IconType.FONT);
        await checkAction$(rowActions[5], 'custom row action 2', 'angular', IconType.SVG);

        // Row-Actions - 2. Level
        {
          expect(await rowActions[3].hasSubmenu()).toBeTrue();
          const subListActionsMenu = await rowActions[3].getSubmenu();
          expect(subListActionsMenu).toBeTruthy();
          await subListActionsMenu.open();
          const subListActions = await subListActionsMenu.getItems();
          expect(subListActions.length).toEqual(1);
          await checkAction$(subListActions[0], 'visible', 'check', IconType.FONT);
        }
      });

      it('nested menus display no icon, if all entries do not specify one', async () => {
        const selectBoxes = await table.getSelectCheckboxes();
        expect(selectBoxes.length).toBeTruthy();
        await selectBoxes[1].check();

        // List-Actions
        const listActionsMenu = await table.getListActionsButton();
        await listActionsMenu.open();
        const listActions = await listActionsMenu.getItems();
        expect(listActions.length).toEqual(6);

        // List-Actions - 2. Level
        expect(await listActions[2].hasSubmenu()).toBeTrue();
        const subListActionsMenu = await listActions[2].getSubmenu();
        expect(subListActionsMenu).toBeTruthy();
        await subListActionsMenu.open();
        const subListActions = await subListActionsMenu.getItems();
        expect(subListActions.length).toEqual(2);
        await checkAction$(subListActions[0], 'custom all action 3 subaction 1');
        await checkAction$(subListActions[1], 'custom all action 3 subaction 2');

        // Row-Actions
        const rowActionsMenu = await table.getRowActionsButton(1);
        await rowActionsMenu.open();
        const rowActions = await rowActionsMenu.getItems();
        expect(rowActions.length).toEqual(6);
      });

      async function checkAction$(
        matMenuItemHarness: MatMenuItemHarness,
        expectedText: string,
        expectedIcon?: string,
        expectedType?: IconType
      ): Promise<void> {
        expect(matMenuItemHarness).toBeTruthy();

        // toContain instead of toEqual, because the result of getText() can contain the icon name if it is not a svgIcon
        expect(await matMenuItemHarness.getText()).toContain(expectedText);
        const hasIcon = expectedIcon !== undefined && expectedType !== undefined;

        if (hasIcon) {
          const matIconHarness = await matMenuItemHarness.getHarness(MatIconHarness);
          expect(matIconHarness).toBeTruthy();
          expect(await matIconHarness.getName()).toEqual(expectedIcon);
          expect(await matIconHarness.getType()).toEqual(expectedType);
        } else {
          // getHarness() throws an error, if nothing was found
          const matIconHarnesses = await matMenuItemHarness.getAllHarnesses(MatIconHarness);
          expect(matIconHarnesses).toHaveSize(0);
        }
      }
    });
  });
});
