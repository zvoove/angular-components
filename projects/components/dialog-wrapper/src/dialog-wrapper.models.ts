import { IPsButton, IPsException } from '@prosoft/components/core';
import { Observable } from 'rxjs';

export interface IPsDialogWrapperDataSource {
  readonly dialogTitle: string | null;
  readonly buttons: IPsButton[];
  readonly contentVisible: boolean;
  readonly contentBlocked: boolean;
  readonly exception: IPsException | null;
  connect(): Observable<void>;
  disconnect(): void;
}
