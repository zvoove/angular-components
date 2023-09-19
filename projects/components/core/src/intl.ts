import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

// TODO: savebar and form are unused #64441
export interface IZvSavebarIntlTexts {
  saveLabel: string;
  saveAndCloseLabel: string;
  cancelLabel: string;
}

// TODO: Can be removed with Typescript 3.5 #64441
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Exclude<T, U> = T extends U ? never : T;
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

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

export declare type ZvIntlKeys = 'form' | 'savebar' | 'table';

@Injectable({ providedIn: 'root' })
export abstract class ZvIntlService {
  public intlChanged$ = new Subject<void>();

  public abstract get(intlKey: 'table'): IZvTableIntlTexts;
  public abstract get(intlKey: 'savebar'): IZvSavebarIntlTexts;
  public abstract get(intlKey: ZvIntlKeys): IZvSavebarIntlTexts | IZvTableIntlTexts;

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
  private formSavebarIntl: IZvSavebarIntlTexts = {
    saveLabel: 'Save',
    saveAndCloseLabel: 'Save & close',
    cancelLabel: 'Cancel',
  };

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
  public get(intlKey: 'savebar'): IZvSavebarIntlTexts;
  public get(intlKey: ZvIntlKeys): IZvSavebarIntlTexts | IZvTableIntlTexts {
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
