import { FormGroup } from '@angular/forms';
import { IPsButton, IPsException } from '@prosoft/components/core';
import { IPsSavebarMode } from '@prosoft/components/savebar';
import { Observable } from 'rxjs';

/**
 * @deprecated Will be replaced with IPsBtton
 */
// tslint:disable-next-line:no-empty-interface
export interface IPsFormButton extends IPsButton {}

/**
 * @deprecated Will be replaced with IPsException
 */
// tslint:disable-next-line:no-empty-interface
export interface IPsFormException extends IPsException {}

export interface IPsFormDataSourceConnectOptions {
  errorInView$: Observable<boolean>;
  scrollToError(): void;
}

export interface IPsFormDataSource {
  readonly form: FormGroup;
  readonly autocomplete: 'on' | 'off';
  readonly buttons: IPsButton[];
  readonly contentVisible: boolean;
  readonly contentBlocked: boolean;
  readonly exception: IPsException | null;
  readonly savebarMode: IPsSavebarMode;
  connect(options: IPsFormDataSourceConnectOptions): Observable<void>;
  disconnect(): void;
}
