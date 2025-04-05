import { computed, DestroyRef, inject, Signal, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

export interface IZvActionDataSource {
  readonly succeeded: Signal<boolean>;
  readonly isLoading: Signal<boolean>;
  readonly hasError: Signal<boolean>;
  readonly error: Signal<unknown>;
  execute(): void;
}

export interface ZvActionDataSourceOptions {
  actionFn: () => Observable<unknown>;
}

export class ZvActionDataSource implements IZvActionDataSource {
  readonly #state = signal<{ state: 'idle' | 'loading' | 'success' | 'error'; error: unknown }>({
    state: 'idle',
    error: null,
  });
  readonly #destroyRef = inject(DestroyRef);
  #actionSub = Subscription.EMPTY;

  constructor(private options: ZvActionDataSourceOptions) {
    this.#destroyRef.onDestroy(() => this.#actionSub.unsubscribe());
  }

  public readonly error = computed(() => this.#state().error);
  public readonly isLoading = computed(() => this.#state().state == 'loading');
  public readonly hasError = computed(() => this.#state().state == 'error');
  public readonly succeeded = computed(() => this.#state().state == 'success');

  public execute() {
    this.#actionSub.unsubscribe();
    this.#state.set({
      error: null,
      state: 'loading',
    });

    let load$ = this.options.actionFn();
    load$ = load$.pipe(first());

    this.#actionSub = load$.subscribe({
      next: () => {
        this.#state.set({
          error: null,
          state: 'success',
        });
      },
      error: (err: unknown) => {
        this.#state.set({
          error: err,
          state: 'error',
        });
      },
    });
  }
}
