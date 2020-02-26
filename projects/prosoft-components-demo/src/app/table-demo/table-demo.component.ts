import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { PsTableComponent, PsTableDataSource } from '@prosoft/components/table';
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
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  );
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
  return rows.map(x => generateSampleDataRow(x));
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
  @ViewChild(PsTableComponent, { static: false }) public table: PsTableComponent;

  public clientSampleDataSource = new PsTableDataSource<ISampleData>(() => {
    return of(sampleData);
  }, 'client');
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
  public cardLayout = true;
  public striped = true;
  public sortDefinitions = true;
  public pageDebounce = 1000;
  public dataSourceType: 'client' | 'loading' | 'error' | 'empty' = 'client';
  public dataSource: PsTableDataSource<ISampleData> = this.clientSampleDataSource;

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
