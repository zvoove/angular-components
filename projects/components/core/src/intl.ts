import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

// TODO: try to move this to the table data source and remove the intl stuff here altogether #64442
export interface IZvTableIntlTexts extends Omit<MatPaginatorIntl, 'changes'> {
  searchLabel: string;
  sortLabel: string;
  refreshListLabel: string;
  settingsLabel: string;
  noEntriesLabel: string;
  saveLabel: string;
  cancelLabel: string;
  displayedColumnsLabel: string;
}

export declare type ZvIntlKeys = 'table';

@Injectable({ providedIn: 'root' })
export abstract class ZvIntlService {
  public intlChanged$ = new Subject<void>();

  public abstract get(intlKey: 'table'): IZvTableIntlTexts;
  public abstract get(intlKey: ZvIntlKeys): IZvTableIntlTexts;

  // eslint-disable-next-line @typescript-eslint/ban-types
  public merge<T extends {}>(intl1: T, overrides: Partial<T>): T {
    if (!overrides) {
      return intl1;
    }
    const result: any = Object.assign({}, intl1);
    for (const [key, value] of Object.entries(overrides)) {
      if (value) {
        result[key] = value;
      }
    }
    return result;
  }
}

@Injectable()
export class ZvIntlServiceEn extends ZvIntlService {
  private paginatorIntl = new MatPaginatorIntl();

  private tableIntl: IZvTableIntlTexts = {
    saveLabel: 'Save',
    cancelLabel: 'Cancel',
    searchLabel: 'Search',
    sortLabel: 'Sorting',
    refreshListLabel: 'Refresh list',
    settingsLabel: 'List settings',
    noEntriesLabel: 'No entries',
    displayedColumnsLabel: 'Displayed columns',

    itemsPerPageLabel: this.paginatorIntl.itemsPerPageLabel,
    nextPageLabel: this.paginatorIntl.nextPageLabel,
    previousPageLabel: this.paginatorIntl.previousPageLabel,
    firstPageLabel: this.paginatorIntl.firstPageLabel,
    lastPageLabel: this.paginatorIntl.lastPageLabel,
    getRangeLabel: this.paginatorIntl.getRangeLabel,
  };

  public get(intlKey: 'table'): IZvTableIntlTexts;
  public get(intlKey: ZvIntlKeys): IZvTableIntlTexts {
    switch (intlKey) {
      case 'table':
        return this.tableIntl;
      default:
        return null;
    }
  }
}
