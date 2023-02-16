import { IZvException } from '@zvoove/components/core';
import { Observable } from 'rxjs';

export interface IZvViewDataSource {
  readonly contentVisible: boolean;
  readonly contentBlocked: boolean;
  readonly exception: IZvException | null;
  connect(): Observable<void>;
  disconnect(): void;
}
