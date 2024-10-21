/* eslint-disable @typescript-eslint/no-floating-promises */
import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const htmlContent = `
<ps-table
  #table
  *ngIf="show"
  tableId="example"
  [dataSource]="dataSource"
  [caption]="caption"
  [sortDefinitions]="
    sortDefinitions && !disableAllSortable ? [{ displayName: 'custom: '{boolean}{string}', prop: 'hiddenSortable' }] : null
  "
  [refreshable]="refreshable"
  [filterable]="filterable"
  [showSettings]="showSettings"
  [layout]="layout"
  [striped]="striped"
  [pageDebounce]="pageDebounce"
  (page)="onPage($event)"
>
  <ps-table-column [header]="'id'" property="id" [sortable]="!disableAllSortable"></ps-table-column>
  <ps-table-column [header]="'number'" property="num" [sortable]="!disableAllSortable"></ps-table-column>
  <ps-table-column [header]="'boolean'" property="bool" [sortable]="!disableAllSortable"></ps-table-column>
  <ps-table-column
    [header]="columnHeader"
    property="date"
    [mandatory]="columnMandatory"
    [sortable]="columnSortable && !disableAllSortable"
    [headerStyles]="columnHeaderStyles ? { color: 'green' } : null"
    [columnStyles]="columnColumnStyles ? { color: 'green' } : null"
    [width]="columnWidth"
  >
    <ng-container *ngIf="columnHeaderTemplate">
      <ng-container *psTableColumnHeaderTemplate>
        <i style="color: blue">date</i>
      </ng-container>
    </ng-container>
    <ng-container *ngIf="columnColumnTemplate">
      <ng-container *psTableColumnTemplate="let item">
        {{ item.date | date: 'yyyy-MM-dd HH:mm:ss' }}
      </ng-container>
    </ng-container>
  </ps-table-column>
  <ps-table-column [header]="'string'" property="str" [sortable]="!disableAllSortable"></ps-table-column>
  <ps-table-column
    [header]="'Custom row detail toggle'"
    property="__custom"
    [sortable]="false"
    *ngIf="showCustomToggleColumn && expandable"
  >
    <ng-container *psTableColumnTemplate="let item; let expanded = expanded">
      <button (click)="table.toggleRowDetail(item)">Custom row detail expand button</button>
    </ng-container>
  </ps-table-column>
  <ps-table-column [header]="'virtual column'" property="__virtual" [sortable]="false">
    <ng-container *psTableColumnTemplate="let item; let expanded = expanded"> expanded: {{ expanded }} </ng-container>
  </ps-table-column>

  <ng-container *ngIf="customHeader">
    <div *psTableCustomHeader style="border: 1px solid black; width: 100%">custom header</div>
  </ng-container>

  <ng-container *ngIf="customSettings">
    <div *psTableCustomSettings style="border: 1px solid black; width: 100%">custom settings</div>
  </ng-container>

  <ng-container *ngIf="customTopButton">
    <div *psTableTopButtonSection style="border: 1px solid black">custom button section</div>
  </ng-container>

  <ng-container *ngIf="customListActions">
    <ng-container *psTableListActions="let selection">
      <button type="button" mat-menu-item (click)="alertData(selection)">custom list actions</button>
    </ng-container>
  </ng-container>

  <ng-container *ngIf="customRowActions">
    <ng-container *psTableRowActions="let item">
      <button type="button" mat-menu-item>item {{ item.id }} custom row actions</button>
    </ng-container>
  </ng-container>

  <ng-container *ngIf="expandable">
    <ps-table-row-detail [expanded]="expanded" [showToggleColumn]="showToggleColumn">
      <ng-container *psTableRowDetailTemplate="let item"> item: {{ item.id }} expanded: {{ expanded }} </ng-container>
    </ps-table-row-detail>
  </ng-container>
</ps-table>
`;

const htmlModifiedContent = `
<zv-table
  #table
  *ngIf="show"
  tableId="example"
  [dataSource]="dataSource"
  [caption]="caption"
  [sortDefinitions]="
    sortDefinitions && !disableAllSortable ? [{ displayName: 'custom: '{boolean}{string}', prop: 'hiddenSortable' }] : null
  "
  [refreshable]="refreshable"
  [filterable]="filterable"
  [showSettings]="showSettings"
  [layout]="layout"
  [striped]="striped"
  [pageDebounce]="pageDebounce"
  (page)="onPage($event)"
>
  <zv-table-column [header]="'id'" property="id" [sortable]="!disableAllSortable"></zv-table-column>
  <zv-table-column [header]="'number'" property="num" [sortable]="!disableAllSortable"></zv-table-column>
  <zv-table-column [header]="'boolean'" property="bool" [sortable]="!disableAllSortable"></zv-table-column>
  <zv-table-column
    [header]="columnHeader"
    property="date"
    [mandatory]="columnMandatory"
    [sortable]="columnSortable && !disableAllSortable"
    [headerStyles]="columnHeaderStyles ? { color: 'green' } : null"
    [columnStyles]="columnColumnStyles ? { color: 'green' } : null"
    [width]="columnWidth"
  >
    <ng-container *ngIf="columnHeaderTemplate">
      <ng-container *zvTableColumnHeaderTemplate>
        <i style="color: blue">date</i>
      </ng-container>
    </ng-container>
    <ng-container *ngIf="columnColumnTemplate">
      <ng-container *zvTableColumnTemplate="let item">
        {{ item.date | date: 'yyyy-MM-dd HH:mm:ss' }}
      </ng-container>
    </ng-container>
  </zv-table-column>
  <zv-table-column [header]="'string'" property="str" [sortable]="!disableAllSortable"></zv-table-column>
  <zv-table-column
    [header]="'Custom row detail toggle'"
    property="__custom"
    [sortable]="false"
    *ngIf="showCustomToggleColumn && expandable"
  >
    <ng-container *zvTableColumnTemplate="let item; let expanded = expanded">
      <button (click)="table.toggleRowDetail(item)">Custom row detail expand button</button>
    </ng-container>
  </zv-table-column>
  <zv-table-column [header]="'virtual column'" property="__virtual" [sortable]="false">
    <ng-container *zvTableColumnTemplate="let item; let expanded = expanded"> expanded: {{ expanded }} </ng-container>
  </zv-table-column>

  <ng-container *ngIf="customHeader">
    <div *zvTableCustomHeader style="border: 1px solid black; width: 100%">custom header</div>
  </ng-container>

  <ng-container *ngIf="customSettings">
    <div *zvTableCustomSettings style="border: 1px solid black; width: 100%">custom settings</div>
  </ng-container>

  <ng-container *ngIf="customTopButton">
    <div *zvTableTopButtonSection style="border: 1px solid black">custom button section</div>
  </ng-container>

  <ng-container *ngIf="customListActions">
    <ng-container *zvTableListActions="let selection">
      <button type="button" mat-menu-item (click)="alertData(selection)">custom list actions</button>
    </ng-container>
  </ng-container>

  <ng-container *ngIf="customRowActions">
    <ng-container *zvTableRowActions="let item">
      <button type="button" mat-menu-item>item {{ item.id }} custom row actions</button>
    </ng-container>
  </ng-container>

  <ng-container *ngIf="expandable">
    <zv-table-row-detail [expanded]="expanded" [showToggleColumn]="showToggleColumn">
      <ng-container *zvTableRowDetailTemplate="let item"> item: {{ item.id }} expanded: {{ expanded }} </ng-container>
    </zv-table-row-detail>
  </ng-container>
</zv-table>
`;

const tsContent = `
import { CommonModule } from '@angular/common';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { PsIntlService, PsIntlServiceEn } from '@prosoft/components/core';
import { IPsTableSetting, PsTableModule, PsTableSettingsService } from '@prosoft/components/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { TableDemoComponent } from './table-demo.component';

@Injectable()
export class DemoPsTableSettingsService extends PsTableSettingsService {
  private settings$ = new BehaviorSubject<{ [id: string]: IPsTableSetting }>({});
  constructor() {
    super();
    this.settingsEnabled = true;
  }

  public override getStream(tableId: string): Observable<IPsTableSetting> {
    return this.settings$.pipe(map((settings) => settings[tableId]));
  }
  public override save(tableId: string, settings: IPsTableSetting): Observable<void> {
    this.settings$.next({ [tableId]: settings });
    return of(null);
  }
}

@NgModule({
  declarations: [TableDemoComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    PsTableModule,
    MatFormFieldModule,
    RouterModule.forChild([
      {
        path: '',
        component: TableDemoComponent,
      },
    ]),
  ],
  providers: [
    { provide: PsIntlService, useClass: PsIntlServiceEn },
    { provide: PsTableSettingsService, useClass: DemoPsTableSettingsService },
  ],
})
export class TableDemoModule {}

`;

const tsModifiedContent = `
import { CommonModule } from '@angular/common';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ZvIntlService, ZvIntlServiceEn } from '@zvoove/components/core';
import { IZvTableSetting, ZvTableModule, ZvTableSettingsService } from '@zvoove/components/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { TableDemoComponent } from './table-demo.component';

@Injectable()
export class DemoZvTableSettingsService extends ZvTableSettingsService {
  private settings$ = new BehaviorSubject<{ [id: string]: IZvTableSetting }>({});
  constructor() {
    super();
    this.settingsEnabled = true;
  }

  public override getStream(tableId: string): Observable<IZvTableSetting> {
    return this.settings$.pipe(map((settings) => settings[tableId]));
  }
  public override save(tableId: string, settings: IZvTableSetting): Observable<void> {
    this.settings$.next({ [tableId]: settings });
    return of(null);
  }
}

@NgModule({
  declarations: [TableDemoComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    ZvTableModule,
    MatFormFieldModule,
    RouterModule.forChild([
      {
        path: '',
        component: TableDemoComponent,
      },
    ]),
  ],
  providers: [
    { provide: ZvIntlService, useClass: ZvIntlServiceEn },
    { provide: ZvTableSettingsService, useClass: DemoZvTableSettingsService },
  ],
})
export class TableDemoModule {}

`;

describe('rename-prosoft-to-zvoove', () => {
  it('should rename the dom element and directives in html files', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../../migrations.json'));
    const tree = Tree.empty();
    tree.create('/app.component.html', htmlContent);
    tree.create('/multiple/sub/folders/test.component.html', htmlContent);
    const resultTree = await runner.runSchematic('ng-add', {}, tree);
    expect(resultTree.files).toEqual(['/app.component.html', '/multiple/sub/folders/test.component.html']);
    validateHtmlFile(resultTree.get('/app.component.html'), true);
    validateHtmlFile(resultTree.get('/multiple/sub/folders/test.component.html'), true);
  });

  it('should rename the imports in .ts files', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../../migrations.json'));
    const tree = Tree.empty();
    tree.create('/app.module.ts', tsContent);
    tree.create('/multiple/sub/folders/test.module.ts', tsContent);
    const resultTree = await runner.runSchematic('ng-add', {}, tree);
    expect(resultTree.files).toEqual(['/app.module.ts', '/multiple/sub/folders/test.module.ts']);
    validateTsFile(resultTree.get('/app.module.ts'), true);
    validateTsFile(resultTree.get('/multiple/sub/folders/test.module.ts'), true);
  });

  function validateHtmlFile(file: FileEntry | null, changed: boolean) {
    expect(file).toBeDefined();
    if (file) {
      expect(file.content.toString()).toEqual(changed ? htmlModifiedContent : htmlContent);
    }
  }
  function validateTsFile(file: FileEntry | null, changed: boolean) {
    expect(file).toBeDefined();
    if (file) {
      expect(file.content.toString()).toEqual(changed ? tsModifiedContent : tsContent);
    }
  }
});
