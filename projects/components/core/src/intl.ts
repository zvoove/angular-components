import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

export interface IPsSavebarIntlTexts {
  saveLabel: string;
  saveAndCloseLabel: string;
  cancelLabel: string;
}

// Can be removed with Typescript 3.5
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Exclude<T, U> = T extends U ? never : T;
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface IPsTableIntlTexts extends Omit<MatPaginatorIntl, 'changes'> {
  searchLabel: string;
  sortLabel: string;
  refreshListLabel: string;
  settingsLabel: string;
  noEntriesLabel: string;
  saveLabel: string;
  cancelLabel: string;
  displayedColumnsLabel: string;
}

export declare type PsIntlKeys = 'form' | 'savebar' | 'table';

@Injectable({ providedIn: 'root' })
export abstract class PsIntlService {
  public intlChanged$ = new Subject<void>();

  public abstract get(intlKey: 'table'): IPsTableIntlTexts;
  public abstract get(intlKey: 'savebar'): IPsSavebarIntlTexts;
  public abstract get(intlKey: PsIntlKeys): IPsSavebarIntlTexts | IPsTableIntlTexts;

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

export class PsIntlServiceEn extends PsIntlService {
  private paginatorIntl = new MatPaginatorIntl();
  private formSavebarIntl: IPsSavebarIntlTexts = {
    saveLabel: 'Save',
    saveAndCloseLabel: 'Save & close',
    cancelLabel: 'Cancel',
  };

  private tableIntl: IPsTableIntlTexts = {
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

  public get(intlKey: 'table'): IPsTableIntlTexts;
  public get(intlKey: 'savebar'): IPsSavebarIntlTexts;
  public get(intlKey: PsIntlKeys): IPsSavebarIntlTexts | IPsTableIntlTexts {
    switch (intlKey) {
      case 'table':
        return this.tableIntl;
      case 'savebar':
        return this.formSavebarIntl;
      default:
        return null;
    }
  }
}
