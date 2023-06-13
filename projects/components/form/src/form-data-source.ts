import { FormGroup } from '@angular/forms';
import { IZvButton, IZvException } from '@zvoove/components/core';
import { Observable } from 'rxjs';

export declare type IZvSavebarMode = 'sticky' | 'fixed' | 'auto' | 'hide';
export interface IZvFormDataSourceConnectOptions {
  errorInView$: Observable<boolean>;
  scrollToError(): void;
}

export interface IZvFormDataSource {
  readonly form: FormGroup;
  readonly autocomplete: 'on' | 'off';
  readonly buttons: IZvButton[];
  readonly contentVisible: boolean;
  readonly contentBlocked: boolean;
  readonly exception: IZvException | null;
  readonly savebarMode: IZvSavebarMode;
  readonly progress?: number | null;
  connect(options: IZvFormDataSourceConnectOptions): Observable<void>;
  disconnect(): void;
}
