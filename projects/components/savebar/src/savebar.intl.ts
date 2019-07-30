import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface IPsSavebarIntlTexts {
  saveLabel: string;
  saveAndCloseLabel: string;
  cancelLabel: string;
  nextLabel: string;
  prevLabel: string;
}

@Injectable()
export abstract class PsSavebarIntl implements IPsSavebarIntlTexts {
  public intlChanged$ = new Subject<void>();

  public abstract saveLabel: string;
  public abstract saveAndCloseLabel: string;
  public abstract cancelLabel: string;
  public abstract nextLabel: string;
  public abstract prevLabel: string;
}

export class PsSavebarIntlEn extends PsSavebarIntl {
  public saveLabel = 'Save';
  public saveAndCloseLabel = 'Save & close';
  public cancelLabel = 'Cancel';
  public nextLabel = 'Next';
  public prevLabel = 'Previous';
}
