import { Observable } from 'rxjs';

// TODO Maybe we could merge IPsViewException with IPsFormException because they share the same properties (breaking change!)
export interface IPsViewException {
  errorObject: any;
  icon?: string;
  alignCenter?: boolean;
}

export interface IPsViewDataSource {
  readonly contentVisible: boolean;
  readonly contentBlocked: boolean;
  readonly exception: IPsViewException;
  connect(): Observable<void>;
  disconnect(): void;
}
