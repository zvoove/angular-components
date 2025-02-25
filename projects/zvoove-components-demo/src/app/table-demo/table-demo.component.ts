import { DatePipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import {
  IZvTableAction,
  IZvTableActionRouterLink,
  ZvTable,
  ZvTableActionScope,
  ZvTableDataSource,
  ZvTableModule,
  ZvTableSettingsService,
} from '@zvoove/components/table';
import { Observable, of, timer } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { allSharedImports } from '../common/shared-imports';
import { DemoTableSettingsService } from './demo-table-settings.service';
import { TableApiDocComponent } from './table-api-doc.component';

interface ISampleData {
  id: number;
  num: number;
  date: Date;
  str: string;
  bool: boolean;
  hiddenSortable: string;
}

function generateNumber() {
  return Math.round(Math.random() * 100);
}

function generateBoolean() {
  return Math.random() > 0.5;
}

function generateDate() {
  const date = new Date();
  date.setDate(Math.random() * 30);
  return date;
}
function generateString() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateSampleDataRow(idx: number): ISampleData {
  const num = generateNumber();
  const bool = generateBoolean();
  const date = generateDate();
  const str = generateString();
  return {
    id: idx,
    num: num,
    bool: bool,
    date: date,
    str: str,
    hiddenSortable: `${bool}${str}`,
  };
}
function generateSampleData(rowCount: number): ISampleData[] {
  const rows = Array.from(new Array(rowCount).keys());
  return rows.map((x) => generateSampleDataRow(x));
}

@Component({
  selector: 'app-table-demo',
  templateUrl: './table-demo.component.html',
  styles: [
    `
      .app-table-demo__settings {
        display: flex;
        flex-wrap: wrap;
        gap: 1em;

        margin-bottom: 1em;
      }
      .app-table-demo__settings-box {
        display: grid;
        gap: 1em;
        align-content: start;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    allSharedImports,
    MatCardModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    ZvTableModule,
    JsonPipe,
    DatePipe,
    TableApiDocComponent,
  ],
  providers: [{ provide: ZvTableSettingsService, useClass: DemoTableSettingsService }],
})
export class TableDemoComponent {
  public show = true;
  @ViewChild(ZvTable) public table: ZvTable;

  public pageEvent: PageEvent;

  public caption = 'table caption';
  public refreshable = true;
  public filterable = true;
  public showSettings = true;
  public layout: 'card' | 'border' | 'flat' = 'card';
  public striped = true;
  public sortDefinitions = false;
  public preferSortDropdown = false;
  public actionsWithLinks = false;
  public pageDebounce = 0;
  public dataSourceType: 'server' | 'client' = 'server';

  public dsThrowError = false;
  public dsDataCount = 100;
  public dsData = generateSampleData(this.dsDataCount);
  public dsLoadDelay = 1000;
  public dataSource: ZvTableDataSource<ISampleData>;

  public columnHeaderTemplate = false;
  public columnColumnTemplate = true;
  public columnSortable = true;
  public columnMandatory = true;
  public columnHeader = 'date';
  public columnWidth = 'auto';
  public columnHeaderStyles = false;
  public columnColumnStyles = false;

  public customHeader = false;
  public customSettings = false;
  public customTopButton = false;
  public expandable = false;
  public expanded = false;
  public showToggleColumn = true;
  public showCustomToggleColumn = false;

  public disableAllSortable = false;

  constructor(private cd: ChangeDetectorRef) {
    this.rebuildDataSource();
  }

  public rebuildSampleData() {
    this.dsData = generateSampleData(this.dsDataCount);
    this.reloadTable();
  }

  public reloadTable() {
    this.dataSource.updateData();
  }

  public rebuildTable() {
    this.show = false;
    setTimeout(() => {
      this.show = true;
      this.cd.markForCheck();
    });
  }

  public onPage(event: PageEvent) {
    this.pageEvent = event;
  }

  public alertData(data: any) {
    alert(JSON.stringify(data));
  }

  public rebuildDataSource() {
    const actionConfig = {
      actionFn: !this.actionsWithLinks ? (items: unknown) => console.log(items) : undefined,
      routerLink: this.actionsWithLinks ? () => ({ path: ['/', 'table'] }) : undefined,
    };
    this.dataSource = new ZvTableDataSource<ISampleData>({
      mode: this.dataSourceType,
      loadTrigger$: of(null),
      loadDataFn: (filter) =>
        timer(this.dsLoadDelay).pipe(
          first(),
          map(() => {
            let data = [...this.dsData];
            if (this.dsThrowError) {
              throw new Error('Error while loading the data.');
            }
            if (this.dataSourceType === 'client') {
              return data;
            }
            const start = filter.currentPage * filter.pageSize;
            data = data.filter((x) => JSON.stringify(x).indexOf(filter.searchText) !== -1);
            data.sort((a, b) => {
              const aProp = a[filter.sortColumn as keyof typeof a];
              const bProp = b[filter.sortColumn as keyof typeof b];
              let result = aProp < bProp ? 1 : -1;
              if (filter.sortDirection === 'asc') {
                result *= -1;
              }
              return result;
            });
            return {
              items: data.slice(start, start + filter.pageSize),
              totalItems: data.length,
            };
          })
        ),
      loadRowActionFn: (data, actions) =>
        timer(5000).pipe(
          map(() => {
            if (this.dsThrowError) {
              throw new Error('Error while loading the row data.');
            }

            return this.changeRandomRowActionData(data, actions);
          })
        ),
      openRowMenuActionFn: (data, actions) => this.addRowActionData(data, actions),
      actions: [
        {
          label: 'rowAction 1',
          icon: 'check',
          iconColor: 'green',
          scope: ZvTableActionScope.row,
          ...actionConfig,
        },
        {
          label: 'rowAction 2 with 2 childs, one hidden',
          icon: 'cancel',
          scope: ZvTableActionScope.row,
          children: [
            {
              label: 'rowAction 2 child (visible)',
              isSvgIcon: true,
              icon: 'angular',
              scope: ZvTableActionScope.row,
              isHiddenFn: () => false,
              routerLink: (items) => ({ path: ['/', 'table', items[0].id] }) as IZvTableActionRouterLink,
            },
            {
              label: 'rowAction 2 child (hidden)',
              isSvgIcon: true,
              icon: 'angular',
              scope: ZvTableActionScope.row,
              isHiddenFn: () => true,
              routerLink: (items) => ({ path: ['/', 'table', items[0].id] }) as IZvTableActionRouterLink,
            },
          ],
        },
        {
          label: 'rowAction 3 with hidden childs',
          icon: 'cancel',
          scope: ZvTableActionScope.row,
          children: [
            {
              label: 'rowAction 3 child (hidden)',
              isSvgIcon: true,
              icon: 'angular',
              scope: ZvTableActionScope.row,
              isHiddenFn: () => true,
              routerLink: (items) => ({ path: ['/', 'table', items[0].id] }) as IZvTableActionRouterLink,
            },
          ],
        },
        {
          label: 'listAction 1',
          icon: 'cancel',
          scope: ZvTableActionScope.list,
          ...actionConfig,
        },
        {
          label: 'listAction 2',
          icon: 'cancel',
          scope: ZvTableActionScope.list,
          isDisabledFn: () => true,
          ...actionConfig,
        },
        {
          label: 'listAction 3',
          icon: 'cancel',
          scope: ZvTableActionScope.list,
          isHiddenFn: () => Math.random() > 0.5,
          ...actionConfig,
        },
        {
          label: 'disabledListAction',
          icon: 'cancel',
          scope: ZvTableActionScope.list,
          isDisabledFn: () => true,
          children: [
            {
              label: 'disabledListAction 1',
              icon: 'cancel',
              scope: ZvTableActionScope.list,
              isDisabledFn: () => true,
              ...actionConfig,
            },
            {
              label: 'disabledListAction 2',
              icon: 'cancel',
              scope: ZvTableActionScope.list,
              isDisabledFn: () => true,
              ...actionConfig,
            },
            {
              label: 'disabledListAction 3',
              icon: 'cancel',
              scope: ZvTableActionScope.list,
              isDisabledFn: () => true,
              ...actionConfig,
            },
          ],
        },
        {
          label: 'allAction',
          icon: 'cancel',
          scope: ZvTableActionScope.all,
          children: [
            {
              label: 'allChildAction 1',
              icon: 'cancel',
              scope: ZvTableActionScope.list,
              ...actionConfig,
            },
            {
              label: 'allChildAction 2',
              icon: 'cancel',
              scope: ZvTableActionScope.list,
              children: [
                {
                  label: 'allChildAction 2 Child 1',
                  icon: 'cancel',
                  scope: ZvTableActionScope.list,
                  ...actionConfig,
                },
              ],
            },
            {
              label: 'allChildAction 3',
              icon: 'angular',
              isSvgIcon: true,
              scope: ZvTableActionScope.all,
            },
            {
              label: 'Nested Menus without icons',
              icon: '',
              scope: ZvTableActionScope.all,
              children: [
                {
                  label: 'Nested Menu without any icons 1',
                  icon: '',
                  scope: ZvTableActionScope.all,
                  ...actionConfig,
                },
                {
                  label: 'Nested Menu without any icons 2',
                  icon: '',
                  scope: ZvTableActionScope.all,
                  ...actionConfig,
                },
              ],
            },
          ],
        },
      ],
    });
  }

  private changeRandomRowActionData(data: ISampleData, actions: IZvTableAction<ISampleData>[]): IZvTableAction<ISampleData>[] {
    const result: IZvTableAction<ISampleData>[] = [
      ...actions,
      {
        label: `customActionRowId: ${data.id.toString()}`,
        icon: 'browse_gallery',
        iconColor: 'blue',
        actionFn: () => of(),
        scope: ZvTableActionScope.row,
        children: [
          {
            label: 'customActionRow 1',
            icon: 'browse_gallery',
            iconColor: 'blue',
            actionFn: () => of(),
            scope: ZvTableActionScope.row,
          },
          {
            label: 'customActionRow 2',
            icon: 'browse_gallery',
            iconColor: 'blue',
            actionFn: () => of(),
            scope: ZvTableActionScope.row,
          },
        ],
      },
    ];

    return Math.random() > 0.5 ? [] : result;
  }

  private addRowActionData(
    data: ISampleData,
    actions: IZvTableAction<ISampleData>[]
  ): Observable<IZvTableAction<ISampleData>[]> | IZvTableAction<ISampleData>[] | null {
    let result = null;

    if (Math.random() > 0.5) {
      const newActionLabel = `asyncActionRowId: ${data.id.toString()}`;
      const newActions = [
        {
          label: newActionLabel,
          icon: 'star',
          iconColor: '#8442f5',
          actionFn: () => of(),
          scope: ZvTableActionScope.row,
          children: [
            {
              label: 'customActionRow 1',
              icon: 'star',
              iconColor: '#8442f5',
              actionFn: () => of(),
              scope: ZvTableActionScope.row,
            },
            {
              label: 'customActionRow 2',
              icon: 'star',
              iconColor: '#8442f5',
              actionFn: () => of(),
              scope: ZvTableActionScope.row,
            },
          ],
        },
      ];

      const index = actions.findIndex((item) => item.label === newActionLabel);

      if (index === -1) {
        result = timer(3000).pipe(
          map((): IZvTableAction<ISampleData>[] => {
            if (this.dsThrowError) {
              throw new Error('Error while loading the row data.');
            }

            return [...actions, ...newActions];
          })
        );
      }
    }

    return result;
  }
}
