import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { PsTableComponent, PsTableDataSource } from '@prosoft/components/table';
import { PsTableActionScope } from '@prosoft/components/table/src/models';
import { NEVER, of, throwError } from 'rxjs';

interface ISampleData {
  id: number;
  number: number;
  date: Date;
  string: string;
  boolean: boolean;
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
    number: num,
    boolean: bool,
    date: date,
    string: str,
    hiddenSortable: `${bool}${str}`,
  };
}
function generateSampleData(rowCount: number): ISampleData[] {
  const rows = Array.from(new Array(rowCount).keys());
  return rows.map((x) => generateSampleDataRow(x));
}

const sampleData = generateSampleData(100);

@Component({
  selector: 'app-table-demo',
  templateUrl: './table-demo.component.html',
  styles: [
    `
      .app-table-demo__settings {
        display: grid;
        grid-auto-flow: column;
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
})
export class TableDemoComponent {
  public show = true;
  @ViewChild(PsTableComponent) public table: PsTableComponent;

  public clientSampleDataSource = new PsTableDataSource<ISampleData>(() => {
    return of(sampleData);
  }, 'client');
  public actionsDataSource = new PsTableDataSource<ISampleData>({
    loadDataFn: () => of(sampleData),
    actions: [
      {
        label: 'rowAction 1',
        icon: 'check',
        iconColor: 'green',
        actionFn: () => of(),
        scope: PsTableActionScope.row,
      },
      {
        label: 'rowAction 2',
        icon: 'cancel',
        actionFn: () => of(),
        scope: PsTableActionScope.row,
        isHiddenFn: () => Math.random() > 0.5,
      },
      {
        label: 'listAction 1',
        icon: 'cancel',
        actionFn: () => of(),
        scope: PsTableActionScope.list,
      },
      {
        label: 'listAction 2',
        icon: 'cancel',
        actionFn: () => of(),
        scope: PsTableActionScope.list,
        isDisabledFn: () => true,
      },
      {
        label: 'listAction 3',
        icon: 'cancel',
        actionFn: () => of(),
        scope: PsTableActionScope.list,
        isHiddenFn: () => Math.random() > 0.5,
      },
      {
        label: 'allAction',
        icon: 'cancel',
        scope: PsTableActionScope.all,
        children: [
          {
            label: 'allChildAction 1',
            icon: 'cancel',
            actionFn: () => of(),
            scope: PsTableActionScope.list,
          },
          {
            label: 'allChildAction 2',
            icon: 'cancel',
            scope: PsTableActionScope.list,
            children: [
              {
                label: 'allChildAction 2 Child 1',
                icon: 'cancel',
                actionFn: () => of(),
                scope: PsTableActionScope.list,
              },
            ],
          },
        ],
      },
    ],
  });

  public emptyDataSource = new PsTableDataSource<any>(() => of([]));
  public loadingDataSource = new PsTableDataSource<any>(() => NEVER);
  public errorDataSource = new PsTableDataSource<any>(() => {
    return throwError(new Error('Error while loading the data.'));
  });
  public pageEvent: PageEvent;

  public caption = 'table caption';
  public refreshable = true;
  public filterable = true;
  public showSettings = true;
  public layout: 'card' | 'border' | 'flat' = 'card';
  public striped = true;
  public sortDefinitions = true;
  public pageDebounce = 1000;
  public dataSourceType: 'client' | 'loading' | 'error' | 'actions' | 'empty' = 'actions';
  public dataSource: PsTableDataSource<ISampleData> = this.actionsDataSource;

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
  public customListActions = false;
  public customRowActions = false;
  public expandable = false;
  public expanded = false;
  public showToggleColumn = true;
  public showCustomToggleColumn = false;

  public disableAllSortable = false;

  constructor(private cd: ChangeDetectorRef) {}

  public onDataSourceTypeChanged(event: MatSelectChange) {
    switch (event.value) {
      case 'loading':
        this.dataSource = this.loadingDataSource;
        break;
      case 'error':
        this.dataSource = this.errorDataSource;
        break;
      case 'empty':
        this.dataSource = this.emptyDataSource;
        break;
      case 'actions':
        this.dataSource = this.actionsDataSource;
        break;
      default:
        this.dataSource = this.clientSampleDataSource;
        break;
    }
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
}
