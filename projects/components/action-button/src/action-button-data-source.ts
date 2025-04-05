import { computed, DestroyRef, effect, inject, linkedSignal, Signal } from '@angular/core';
import { ZvActionDataSource, ZvActionDataSourceOptions, ZvExceptionMessageExtractor } from '@zvoove/components/core';

export interface IZvActionButtonDataSource {
  readonly showSuccess: Signal<boolean>;
  readonly showLoading: Signal<boolean>;
  readonly showError: Signal<boolean>;
  readonly error: Signal<unknown>;
  readonly errorMessage: Signal<string | null>;
  readonly disabled: Signal<boolean>;
  execute(): void;
}

export declare type IZvActionButtonDataSourceOptions = ZvActionDataSourceOptions;

export class ZvActionButtonDataSource extends ZvActionDataSource implements IZvActionButtonDataSource {
  readonly #destroyRef = inject(DestroyRef);
  readonly #errorMessageExtractor = inject(ZvExceptionMessageExtractor);
  #timeoutRef: NodeJS.Timeout | undefined;

  public readonly showLoading = this.isLoading;
  public readonly showError = this.hasError;
  public readonly disabled = this.isLoading;
  public readonly showSuccess = linkedSignal(() => this.succeeded());
  public readonly errorMessage = computed(() => (this.hasError() ? this.#errorMessageExtractor.extractErrorMessage(this.error()) : null));

  constructor(options: IZvActionButtonDataSourceOptions) {
    super(options);

    effect(() => {
      if (this.showSuccess()) {
        clearTimeout(this.#timeoutRef);
        this.#timeoutRef = setTimeout(() => {
          this.showSuccess.set(false);
        }, 2000);
      }
    });
    this.#destroyRef.onDestroy(() => clearTimeout(this.#timeoutRef));
  }
}
