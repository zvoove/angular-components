import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, QueryList, SimpleChange, ViewChild } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, ParamMap, Params, Router } from '@angular/router';
import { IPsTableIntlTexts, PsIntlService, PsIntlServiceEn } from '@prosoft/components/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { PsTableDataSource } from './data/table-data-source';
import { PsTableColumnDirective } from './directives/table.directives';
import { IPsTableSortDefinition } from './models';
import { IPsTableSetting, PsTableSettingsService } from './services/table-settings.service';
import { PsTableDataComponent } from './subcomponents/table-data.component';
import { PsTableHeaderComponent } from './subcomponents/table-header.component';
import { PsTableSearchComponent } from './subcomponents/table-search.component';
import { PsTableComponent } from './table.component';
import { PsTableModule } from './table.module';
import { PsTableSettingsComponent } from './subcomponents/table-settings.component';

class TestSettingsService extends PsTableSettingsService {
  public readonly defaultPageSize$ = new BehaviorSubject<number>(15);
  public readonly settings$ = new BehaviorSubject<{ [id: string]: IPsTableSetting }>({});
  public pageSizeOptions = [1, 5, 25, 50];

  public save(id: string, settings: IPsTableSetting): Observable<void> {
    const currentSettings = this.settings$.getValue();
    currentSettings[id] = settings;
    this.settings$.next(currentSettings);

    return of();
  }
}

const router: any = {
  navigate: (_route: any, _options: any) => {},
};

const queryParams$ = new BehaviorSubject<ParamMap>(convertToParamMap({ other: 'value' }));

const route: ActivatedRoute = <any>{
  snapshot: new Proxy(queryParams$, {
    get: (obj, prop) => {
      if (prop === 'queryParamMap') {
        return obj.value;
      }
    },
  }),
  queryParamMap: queryParams$,
};

function createColDef(data: { property?: string; header?: string; sortable?: boolean }) {
  const colDef = new PsTableColumnDirective();
  colDef.sortable = data.sortable || false;
  colDef.property = data.property || null;
  colDef.header = data.header || null;
  return colDef;
}

@Component({
  selector: 'ps-test-component',
  template: `
    <ps-table
      [caption]="caption"
      [dataSource]="dataSource"
      [tableId]="tableId"
      [intlOverride]="intlOverride"
      [refreshable]="refreshable"
      [filterable]="filterable"
      [showSettings]="showSettings"
      [cardLayout]="cardLayout"
      [striped]="striped"
      [sortDefinitions]="sortDefinitions"
      (page)="onPage($event)"
    >
      <ps-table-column [header]="'id'" property="id" [sortable]="true"></ps-table-column>
      <ps-table-column
        [header]="'string'"
        property="str"
        [sortable]="false"
        [headerStyles]="{ color: 'green' }"
        [columnStyles]="{ color: 'blue' }"
      ></ps-table-column>
      <ps-table-column property="__virtual" [mandatory]="true" [width]="'100px'">
        <ng-container *psTableColumnHeaderTemplate>
          <i>custom</i>
        </ng-container>
        <ng-container *psTableColumnTemplate="let item"> custom {{ item.id }} </ng-container>
      </ps-table-column>

      <div *psTableCustomHeader>
        custom header
      </div>

      <div *psTableCustomSettings="let settings">custom settings {{ settings.pageSize }}</div>

      <div *psTableTopButtonSection>
        custom button section
      </div>

      <ng-container *psTableListActions="let selection">
        <button type="button" mat-menu-item (click)="onCustomListActionClick(selection)">
          custom list actions
        </button>
      </ng-container>

      <ng-container *psTableRowActions="let item">
        <button type="button" mat-menu-item (click)="onCustomRowActionClick(item)">item {{ item.id }} custom row actions</button>
      </ng-container>

      <ps-table-row-detail [expanded]="expanded" [showToggleColumn]="showToggleColumn">
        <ng-container *psTableRowDetailTemplate="let item">item: {{ item.id }}</ng-container>
      </ps-table-row-detail>
    </ps-table>
  `,
})
export class TestComponent {
  public caption = 'title';
  public dataSource = new PsTableDataSource(
    () => of([{ id: 1, str: 'item 1' }, { id: 2, str: 'item 2' }, { id: 3, str: 'item 3' }]),
    'client'
  );
  public tableId = 'tableId';
  public intlOverride: Partial<IPsTableIntlTexts>;
  public refreshable = true;
  public filterable = true;
  public showSettings = true;
  public cardLayout = true;
  public striped = true;
  public sortDefinitions: IPsTableSortDefinition[] = [{ prop: '__virtual', displayName: 'Virtual Column' }];

  public expanded = false;
  public showToggleColumn = true;

  @ViewChild(PsTableComponent, { static: true }) table: PsTableComponent;

  public onPage(event: any) {}
  public onCustomListActionClick(slectedItems: any[]) {}
  public onCustomRowActionClick(item: any) {}
}

describe('PsTableComponent', () => {
  describe('isolated', () => {
    const intlService = new PsIntlServiceEn();
    const cd = <ChangeDetectorRef>{ markForCheck: () => {} };

    let settingsService: TestSettingsService;
    function createTableInstance(): PsTableComponent {
      settingsService = new TestSettingsService();
      const table = new PsTableComponent(intlService, settingsService, null, cd, route, router, 'de');
      table.tableId = 'tableid';
      table.dataSource = new PsTableDataSource<any>(() => of([{ a: 'asdfg' }, { a: 'gasdf' }, { a: 'asdas' }, { a: '32424rw' }]));
      table.paginator = new MatPaginator(new MatPaginatorIntl(), cd);
      return table;
    }

    it('should update table state from the settings service and the query params', fakeAsync(() => {
      const table = createTableInstance();
      settingsService.settings$.next({});
      settingsService.defaultPageSize$.next(7);
      table.columnDefs = [createColDef({ property: 'prop1' }), createColDef({ property: 'prop2' })];
      table.rowDetail = <any>{ showToggleColumn: true };
      table.listActions = <any>{};
      table.rowActions = <any>{};

      table.ngOnInit();
      table.ngAfterContentInit();
      tick(1);

      expect(table.pageSize).toEqual(7);
      expect(table.pageIndex).toEqual(0);
      expect(table.filterText).toEqual('');
      expect(table.sortColumn).toEqual(null);
      expect(table.sortDirection).toEqual('asc');
      expect(table.displayedColumns).toEqual(['select', 'rowDetailExpander', 'prop1', 'prop2', 'options']);

      settingsService.settings$.next({
        tableid: <IPsTableSetting>{
          columnBlacklist: ['prop2'],
          pageSize: 22,
          sortColumn: 'col',
          sortDirection: 'desc',
        },
      });
      tick(1);

      expect(table.pageSize).toEqual(22);
      expect(table.pageIndex).toEqual(0);
      expect(table.filterText).toEqual('');
      expect(table.sortColumn).toEqual('col');
      expect(table.sortDirection).toEqual('desc');
      expect(table.displayedColumns).toEqual(['select', 'rowDetailExpander', 'prop1', 'options']);

      queryParams$.next(
        convertToParamMap(<Params>{
          tableid: '1◬1◬asdf◬Column1◬asc',
        })
      );
      tick(1);

      expect(table.pageSize).toEqual(1);
      expect(table.pageIndex).toEqual(1);
      expect(table.filterText).toEqual('asdf');
      expect(table.sortColumn).toEqual('Column1');
      expect(table.sortDirection).toEqual('asc');
      expect(table.displayedColumns).toEqual(['select', 'rowDetailExpander', 'prop1', 'options']);

      table.rowDetail = <any>{ showToggleColumn: false };
      queryParams$.next(convertToParamMap(<Params>{ tableid: '1◬1◬asdf◬Column1◬desc' }));
      tick(1);
      expect(table.displayedColumns).toEqual(['select', 'prop1', 'options']);

      table.rowDetail = null;
      queryParams$.next(convertToParamMap(<Params>{ tableid: '1◬1◬asdf◬Column1◬desc' }));
      tick(1);
      expect(table.displayedColumns).toEqual(['select', 'prop1', 'options']);

      table.listActions = null;
      queryParams$.next(convertToParamMap(<Params>{ tableid: '1◬1◬asdf◬Column1◬desc' }));
      tick(1);
      expect(table.displayedColumns).toEqual(['prop1', 'options']);

      table.rowActions = null;
      table.showSettings = false;
      table.refreshable = false;
      queryParams$.next(convertToParamMap(<Params>{ tableid: '1◬1◬asdf◬Column1◬desc' }));
      tick(1);
      expect(table.displayedColumns).toEqual(['prop1']);
    }));

    it('should initialize page size options from the service', fakeAsync(() => {
      const table = createTableInstance();
      table.settingsService.pageSizeOptions = [3, 7, 9];
      table.ngOnInit();
      expect(table.pageSizeOptions).toBe(table.settingsService.pageSizeOptions);
    }));

    it('should show right content depending on the datatable state', fakeAsync(() => {
      const table = createTableInstance();

      table.dataSource = <any>{ loading: false, error: null, visibleRows: [] };
      expect(table.showNoEntriesText).toBe(true);
      expect(table.showError).toBe(false);
      expect(table.showLoading).toBe(false);

      table.dataSource = <any>{ loading: true, error: null, visibleRows: [] };
      expect(table.showNoEntriesText).toBe(false);
      expect(table.showError).toBe(false);
      expect(table.showLoading).toBe(true);

      table.dataSource = <any>{ loading: false, error: new Error('error'), visibleRows: [] };
      expect(table.showNoEntriesText).toBe(false);
      expect(table.showError).toBe(true);
      expect(table.showLoading).toBe(false);
    }));

    it('should only enable settings if all prerequisites are met', fakeAsync(() => {
      const table = createTableInstance();

      table.tableId = 'test';
      table.showSettings = true;
      table.settingsService.settingsEnabled = true;
      expect(table.settingsEnabled).toBe(true);

      table.settingsService.settingsEnabled = false;
      expect(table.settingsEnabled).toBe(false);
      table.settingsService.settingsEnabled = true;

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
      table.settingsService.settingsEnabled = true;

      table.listActions = null;
      table.refreshable = false;
      expect(table.showListActions).toBe(true);

      table.showSettings = false;
      expect(table.showListActions).toBe(false);

      table.refreshable = true;
      expect(table.showListActions).toBe(true);
      table.refreshable = false;

      table.listActions = <any>{};
      expect(table.showListActions).toBe(true);
    }));

    it('should merge sort definitions and disable sorting on empty', fakeAsync(() => {
      const table = createTableInstance();
      const customSortDef = { prop: 'custom', displayName: 'Custom' };
      const notSortableColDef = new PsTableColumnDirective();
      notSortableColDef.sortable = false;
      notSortableColDef.property = 'no_sort';
      notSortableColDef.header = 'NoSort';
      const sortableColDef = new PsTableColumnDirective();
      sortableColDef.sortable = true;
      sortableColDef.property = 'sort';
      sortableColDef.header = 'Sort';
      const colDefs = new QueryList<PsTableColumnDirective>();

      colDefs.reset([notSortableColDef]);
      table.columnDefsSetter = colDefs;
      table.sortDefinitions = [];
      expect(table.showSorting).toBe(false);
      expect(table.sortDefinitions).toEqual([]);

      colDefs.reset([notSortableColDef, sortableColDef]);
      table.columnDefsSetter = colDefs;
      expect(table.showSorting).toBe(true);
      expect(table.sortDefinitions).toEqual([{ prop: 'sort', displayName: 'Sort' }]);

      table.sortDefinitions = [{ prop: 'custom', displayName: 'Custom' }];
      expect(table.showSorting).toBe(true);
      expect(table.sortDefinitions).toEqual([customSortDef, { prop: 'sort', displayName: 'Sort' }]);

      colDefs.reset([]);
      table.columnDefsSetter = colDefs;
      expect(table.showSorting).toBe(true);
      expect(table.sortDefinitions).toEqual([customSortDef]);

      table.sortDefinitions = [];
      expect(table.showSorting).toBe(false);
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

      (<any>table).requestUpdate();

      const expectedQueryParams = {
        existingParam: '0815',
        requestUpdate: '12◬3◬Blubb◬col◬desc',
      };

      expect(router.navigate).toHaveBeenCalledWith([], { queryParams: expectedQueryParams, relativeTo: route });
    });

    it('should set locale and update data if data source changes', fakeAsync(() => {
      const initialDataSource = new PsTableDataSource(() => of([]), 'client');
      spyOn(initialDataSource, 'updateData');
      const newDataSource = new PsTableDataSource(() => of([]), 'client');
      spyOn(newDataSource, 'updateData');

      const table = createTableInstance();
      table.dataSource = initialDataSource;
      table.ngOnChanges({ dataSource: new SimpleChange(null, initialDataSource, true) });
      table.ngOnInit();
      table.ngAfterContentInit();

      tick(1);

      expect(initialDataSource.locale).toBe('de');

      table.dataSource = newDataSource;
      table.ngOnChanges({ dataSource: new SimpleChange(null, newDataSource, false) });

      expect(newDataSource.locale).toBe('de');

      expect(initialDataSource.updateData).toHaveBeenCalledTimes(1);
      expect(newDataSource.updateData).toHaveBeenCalledTimes(1);
    }));

    it('should update state when sort changes', fakeAsync(() => {
      const table = createTableInstance();
      spyOn(<any>table, 'requestUpdate');
      table.onSortChanged({ sortColumn: 'col', sortDirection: 'desc' });
      expect(table.sortColumn).toEqual('col');
      expect(table.sortDirection).toEqual('desc');
      expect((<any>table).requestUpdate).toHaveBeenCalledTimes(1);
    }));

    it('should update state when filter changes', fakeAsync(() => {
      const table = createTableInstance();
      spyOn(<any>table, 'requestUpdate');
      table.onSearchChanged('test');
      expect(table.filterText).toEqual('test');
      expect((<any>table).requestUpdate).toHaveBeenCalledTimes(1);
    }));

    it('should update state when page changes and emit output', fakeAsync(() => {
      const table = createTableInstance();
      spyOn(table.page, 'emit');
      spyOn(<any>table, 'requestUpdate');
      table.onPage({ pageIndex: 5, pageSize: 3, length: 20, previousPageIndex: 4 });
      expect(table.pageIndex).toEqual(5);
      expect(table.pageSize).toEqual(3);
      expect((<any>table).requestUpdate).toHaveBeenCalledTimes(1);
      expect(table.page.emit).toHaveBeenCalledTimes(1);
    }));

    it('should delete own query params and flip to front when settings are saved', fakeAsync(() => {
      queryParams$.next(convertToParamMap({ existingParam: '0815', tableId: '12◬3◬Blubb◬col◬desc' }));
      spyOn(router, 'navigate');

      const table = createTableInstance();
      table.tableId = 'tableId';
      table.flipContainer = { toggleFlip: () => {} } as any;
      spyOn(table.flipContainer, 'toggleFlip');

      table.onSettingsSaved();

      expect(table.flipContainer.toggleFlip).toHaveBeenCalledTimes(1);
      const expectedQueryParams = {
        existingParam: '0815',
      };
      expect(router.navigate).toHaveBeenCalledWith([], { queryParams: expectedQueryParams, relativeTo: route });
      tick(1);
    }));
  });

  describe('intgration', () => {
    beforeEach(async(() => {
      queryParams$.next(convertToParamMap({}));

      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, CommonModule, PsTableModule],
        declarations: [TestComponent],
        providers: [
          { provide: PsTableSettingsService, useClass: TestSettingsService },
          { provide: PsIntlService, useClass: PsIntlServiceEn },
          { provide: ActivatedRoute, useValue: route },
          { provide: Router, useValue: router },
        ],
      }).compileComponents();
    }));

    it('should resolve intl correctly', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      const intlService: PsIntlServiceEn = TestBed.get(PsIntlService);
      const defaultTableIntl = intlService.get('table');
      fixture.detectChanges();
      const paginator = component.table.paginator;

      expect(component.table.intl).toEqual(defaultTableIntl);
      expect(paginator._intl.getRangeLabel(null, null, null)).toEqual(defaultTableIntl.getRangeLabel(null, null, null));
      expect(paginator._intl.itemsPerPageLabel).toEqual(defaultTableIntl.itemsPerPageLabel);
      expect(paginator._intl.nextPageLabel).toEqual(defaultTableIntl.nextPageLabel);
      expect(paginator._intl.previousPageLabel).toEqual(defaultTableIntl.previousPageLabel);
      expect(paginator._intl.firstPageLabel).toEqual(defaultTableIntl.firstPageLabel);
      expect(paginator._intl.lastPageLabel).toEqual(defaultTableIntl.lastPageLabel);

      component.intlOverride = {
        lastPageLabel: 'asdf',
      };
      fixture.detectChanges();
      expect(component.table.intl.lastPageLabel).toEqual('asdf');
      expect(paginator._intl.lastPageLabel).toEqual('asdf');

      (<any>intlService).tableIntl.previousPageLabel = 'x';
      intlService.intlChanged$.next();
      fixture.detectChanges();
      expect(component.table.intl.previousPageLabel).toEqual('x');
      expect(paginator._intl.previousPageLabel).toEqual('x');
    });

    it('should bind the right properties and events to the ui', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      component.table.settingsService.settingsEnabled = true;
      component.table.settingsService.defaultPageSize$ = of(2);
      fixture.detectChanges();

      const psTableDbg = fixture.debugElement.query(By.directive(PsTableComponent));
      const tableHeaderDbg = psTableDbg.query(By.directive(PsTableHeaderComponent));

      // ps-table[caption]
      expect(fixture.debugElement.query(By.css('h2')).nativeElement.textContent.trim()).toEqual('title');

      // ps-table[cardLayout]
      expect(psTableDbg.classes['mat-elevation-z3']).toEqual(true);

      // ps-table[striped]
      expect(psTableDbg.classes['ps-table--striped']).toEqual(true);

      // *psTableCustomHeader
      expect(tableHeaderDbg.nativeElement.textContent).toContain('custom header');

      // *psTableTopButtonSection
      expect(tableHeaderDbg.nativeElement.textContent).toContain('custom button section');

      tick(1);
      fixture.detectChanges();

      const tableDataEl: HTMLElement = fixture.debugElement.query(By.directive(PsTableDataComponent)).nativeElement;
      const headerRowEl = tableDataEl.querySelectorAll('.mat-header-row').item(0);
      const rowEls = tableDataEl.querySelectorAll('.ps-table-data__row');
      expect(rowEls.length).toEqual(2);

      const strHeaderEl: HTMLElement = headerRowEl.querySelectorAll('.mat-column-str').item(0) as HTMLElement;
      const strFirstCol: HTMLElement = rowEls[0].querySelectorAll('.mat-column-str').item(0) as HTMLElement;
      const virtualHeaderEl: HTMLElement = headerRowEl.querySelectorAll('.mat-column-__virtual').item(0) as HTMLElement;
      const virtualFirstCol: HTMLElement = rowEls[0].querySelectorAll('.mat-column-__virtual').item(0) as HTMLElement;

      // ps-table-column[property]
      expect(strFirstCol.textContent.trim()).toEqual('item 1');

      // ps-table-column[columnStyles]
      expect(strFirstCol.style.color).toEqual('blue');

      // ps-table-column[header]
      expect(strHeaderEl.textContent.trim()).toEqual('string');

      // ps-table-column[headerStyles]
      expect(strHeaderEl.style.color).toEqual('green');

      // *psTableColumnHeaderTemplate
      expect(virtualHeaderEl.textContent.trim()).toEqual('custom');

      // *psTableColumnTemplate
      expect(virtualFirstCol.textContent.trim()).toEqual('custom 1');

      // ps-table-row-detail
      const detailRowEls = tableDataEl.querySelectorAll('.ps-table-data__detail-row');
      expect(detailRowEls[0].clientHeight).toEqual(0);
      expect(detailRowEls[0].textContent.trim()).toEqual('');
      const expandButtonFirstRow: HTMLElement = rowEls[0].querySelectorAll('.mat-column-rowDetailExpander button').item(0) as HTMLElement;
      expandButtonFirstRow.dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(detailRowEls[0].clientHeight > 0).toEqual(true);
      expect(detailRowEls[0].textContent.trim()).toEqual('item: 1');

      // filter
      const searchInputEl = fixture.debugElement
        .query(By.directive(PsTableSearchComponent))
        .nativeElement.querySelectorAll('input')
        .item(0) as HTMLInputElement;
      spyOn(component.table, 'onSearchChanged');
      searchInputEl.value = 'asdf';
      searchInputEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'f' }));
      tick(300);
      expect(component.table.onSearchChanged).toHaveBeenCalledWith('asdf');

      // sort
      spyOn(component.table, 'onSortChanged');
      useMatSelect(fixture, 'ps-table-sort', matOptionNodes => {
        // ps-table[sortDefinitions] + ps-table-column[sortable]
        expect(Array.from(matOptionNodes).map(x => x.textContent.trim())).toEqual(['', 'id', 'Virtual Column']);

        // sort change
        const itemNode = matOptionNodes.item(2);
        itemNode.dispatchEvent(new Event('click'));
      });
      expect(component.table.onSortChanged).toHaveBeenCalledWith({
        sortColumn: '__virtual',
        sortDirection: 'asc',
      });

      // pageing
      const paginatorNextButtonEl = fixture.debugElement
        .query(By.directive(MatPaginator))
        .nativeElement.querySelectorAll('.mat-paginator-navigation-next')
        .item(0) as HTMLButtonElement;
      spyOn(component.table, 'onPage');
      paginatorNextButtonEl.dispatchEvent(new MouseEvent('click'));
      expect(component.table.onPage).toHaveBeenCalledWith({ previousPageIndex: 0, pageIndex: 1, pageSize: 2, length: 3 });

      // *psTableRowActions
      useMatMenu(fixture, '.ps-table-data__options-column button', rowActionButtonEls => {
        spyOn(component, 'onCustomRowActionClick');
        expect(Array.from(rowActionButtonEls).map(x => x.textContent.trim())).toEqual(['item 1 custom row actions']);
        rowActionButtonEls.item(0).dispatchEvent(new MouseEvent('click'));
        flush();
        expect(component.onCustomRowActionClick).toHaveBeenCalledWith({ id: 1, str: 'item 1' });
      });

      // list actions
      const firstRowCheckboxEl = rowEls[0].querySelector('mat-checkbox input');
      firstRowCheckboxEl.dispatchEvent(new MouseEvent('click'));

      useMatMenu(fixture, '.ps-table-data__options-column-header button', listActionButtonEls => {
        // *psTableListActions
        spyOn(component, 'onCustomListActionClick');
        expect(Array.from(listActionButtonEls).map(x => x.textContent.trim())).toEqual([
          'custom list actions',
          'refresh Refresh list',
          'settings List settings',
        ]);
        listActionButtonEls.item(0).dispatchEvent(new MouseEvent('click'));
        flush();
        expect(component.onCustomListActionClick).toHaveBeenCalledWith([{ id: 1, str: 'item 1' }]);

        // refresh
        spyOn(component.table.dataSource, 'updateData');
        listActionButtonEls.item(1).dispatchEvent(new MouseEvent('click'));
        flush();
        expect(component.table.dataSource.updateData).toHaveBeenCalled();

        // settings
        listActionButtonEls.item(2).dispatchEvent(new MouseEvent('click'));
        flush();
        fixture.detectChanges();
        flush();
        expect(component.table.flipContainer.show).toEqual('back');
        fixture.whenRenderingDone().then(() => {
          const tableSettingsDbg = psTableDbg.query(By.directive(PsTableSettingsComponent));
          // *psTableCustomSettings
          expect(tableSettingsDbg.nativeElement.textContent).toContain('custom settings 2');
        });
      });
    }));
  });
});

function openMatMenu<T>(fixture: ComponentFixture<T>, menuTriggerSelector: string) {
  const sortSelectTriggerEl = fixture.debugElement.nativeElement.querySelectorAll(menuTriggerSelector).item(0) as HTMLElement;
  sortSelectTriggerEl.dispatchEvent(new MouseEvent('click'));
  fixture.detectChanges();
}
function getMatMenuNodes(): NodeListOf<HTMLElement> {
  const matMenuItemNodes = document.querySelectorAll('.mat-menu-content > *') as NodeListOf<HTMLElement>;
  return matMenuItemNodes;
}
function closeMatMenu<T>(fixture: ComponentFixture<T>) {
  closeBackdrop(fixture);
}

function useMatMenu<T>(fixture: ComponentFixture<T>, selector: string, useFnc: (options: NodeListOf<HTMLElement>) => void) {
  openMatMenu(fixture, selector);
  useFnc(getMatMenuNodes());
  closeMatMenu(fixture);
}

function openMatSelect<T>(fixture: ComponentFixture<T>, selector: string) {
  const sortSelectTriggerEl = fixture.debugElement.nativeElement.querySelectorAll(selector + ' .mat-select-trigger').item(0) as HTMLElement;
  sortSelectTriggerEl.dispatchEvent(new MouseEvent('click'));
  fixture.detectChanges();
}
function getMatOptionsNodes(): NodeListOf<HTMLElement> {
  const selectPanelNode = document.querySelector('.mat-select-panel');
  const matOptionNodes = selectPanelNode.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
  return matOptionNodes;
}
function closeMatSelect<T>(fixture: ComponentFixture<T>) {
  closeBackdrop(fixture);
}

function useMatSelect<T>(fixture: ComponentFixture<T>, selector: string, useFnc: (options: NodeListOf<HTMLElement>) => void) {
  openMatSelect(fixture, selector);
  useFnc(getMatOptionsNodes());
  closeMatSelect(fixture);
}

function closeBackdrop<T>(fixture: ComponentFixture<T>) {
  document.querySelector('.cdk-overlay-backdrop').dispatchEvent(new MouseEvent('click'));
  fixture.detectChanges();
  flush();

  // Sometimes the mat-select oder mat-menu items aren't cleared and the tests fail. Hopefully this fixes that.
  tick(1);
  fixture.detectChanges();
}
