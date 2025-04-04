import { computed, Signal, signal } from '@angular/core';
import { IZvException } from '@zvoove/components/core';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

export interface IZvActionDataSource {
  readonly succeeded: Signal<boolean>;
  readonly pending: Signal<boolean>;
  readonly hasError: Signal<boolean>;
  readonly exception: Signal<IZvException | null>;
  execute(): void;
}

export interface ZvActionDataSourceOptions<TData> {
  actionFn: () => Observable<TData>;
}

export class ZvActionDataSource<TData> implements IZvActionDataSource {
  private readonly _exception = signal<IZvException | null>(null);
  private readonly _pending = signal(false);
  private readonly _succeeded = signal(false);

  private actionSub = Subscription.EMPTY;

  constructor(private options: ZvActionDataSourceOptions<TData>) {}

  public readonly exception = this._exception.asReadonly();
  public readonly pending = this._pending.asReadonly();
  public readonly hasError = computed(() => this._exception() !== null);
  public readonly succeeded = this._succeeded.asReadonly();

  public execute() {
    this.actionSub.unsubscribe();
    this._pending.set(true);
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
        this._exception.set({
          errorObject: err,
          icon: 'cancel',
        });
      },
    });
  }
}
