import { IPsException } from '@prosoft/components/core';
import { Observable } from 'rxjs';

export interface IPsViewDataSource {
  readonly contentVisible: boolean;
  readonly contentBlocked: boolean;
  readonly exception: IPsException | null;
  connect(): Observable<void>;
  disconnect(): void;
}
