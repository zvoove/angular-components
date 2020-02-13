import { FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { IPsSavebarMode } from '@prosoft/components/savebar';
import { Observable } from 'rxjs';

export interface IPsFormButton {
  label: string;
  type: 'raised' | 'stroked';
  color: ThemePalette;
  disabled: () => boolean;
  click: () => void;
}

export interface IPsFormException {
  errorObject: any;
  icon?: string;
  alignCenter?: boolean;
}

export interface IPsFormDataSource {
  readonly form: FormGroup;
  readonly buttons: IPsFormButton[];
  readonly contentVisible: boolean;
  readonly contentBlocked: boolean;
  readonly exception: IPsFormException;
  readonly savebarMode: IPsSavebarMode;
  connect(): Observable<void>;
  disconnect(): void;
}
