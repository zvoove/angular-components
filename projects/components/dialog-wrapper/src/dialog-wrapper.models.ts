import { IZvButton, IZvException } from '@zvoove/components/core';
import { Observable } from 'rxjs';

export interface IZvDialogWrapperDataSource {
  readonly dialogTitle: string | null;
  readonly buttons: IZvButton[];
  readonly contentVisible: boolean;
  readonly contentBlocked: boolean;
  readonly exception: IZvException | null;
  readonly progress?: number | null;
  connect(): Observable<void>;
  disconnect(): void;
}
