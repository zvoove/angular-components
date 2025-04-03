import { signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

export interface ZvActionDataSourceOptions<TData> {
  actionFn: () => Observable<TData>;
}

export class ZvActionDataSource<TData> {
  private readonly _exception = signal<unknown>(null);
  private readonly _pending = signal(false);
  private readonly _hasError = signal(false);
  private readonly _succeeded = signal(false);

  private actionSub = Subscription.EMPTY;

  constructor(private options: ZvActionDataSourceOptions<TData>) {}

  public readonly exception = this._exception.asReadonly();
  public readonly pending = this._pending.asReadonly();
  public readonly hasError = this._hasError.asReadonly();
  public readonly succeeded = this._succeeded.asReadonly();

  public execute() {
    this.actionSub.unsubscribe();
    this._pending.set(true);
    this._hasError.set(false);
    this._exception.set(null);
    this._succeeded.set(false);

    let load$ = this.options.actionFn();
    load$ = load$.pipe(first());

    this.actionSub = load$.subscribe({
      next: () => {
        this._pending.set(false);
        this._succeeded.set(true);
      },
      error: (err: unknown) => {
        this._pending.set(false);
        this._hasError.set(true);
        this._exception.set(err);
      },
    });
  }
}
