import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface IPsSavebarIntlTexts {
  saveLabel: string;
  saveAndCloseLabel: string;
  cancelLabel: string;
  nextLabel: string;
  prevLabel: string;
}

// tslint:disable-next-line: no-empty-interface
export interface IPsFormIntlTexts extends IPsSavebarIntlTexts {}

export declare type PsIntlKeys = 'form' | 'savebar';

@Injectable({ providedIn: 'root' })
export abstract class PsIntlService {
  public intlChanged$ = new Subject<void>();

  public abstract get(intlKey: 'form'): IPsFormIntlTexts;
  public abstract get(intlKey: 'savebar'): IPsSavebarIntlTexts;
  public abstract get(intlKey: PsIntlKeys): IPsSavebarIntlTexts | IPsFormIntlTexts;

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
  private intl: IPsSavebarIntlTexts | IPsFormIntlTexts = {
    saveLabel: 'Save',
    saveAndCloseLabel: 'Save & close',
    cancelLabel: 'Cancel',
    nextLabel: 'Next',
    prevLabel: 'Previous',
  };

  public get(_: PsIntlKeys): IPsSavebarIntlTexts | IPsFormIntlTexts {
    return this.intl;
  }
}
