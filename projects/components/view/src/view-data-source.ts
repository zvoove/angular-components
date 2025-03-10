import { computed, signal, Signal } from '@angular/core';
import { IZvException } from '@zvoove/components/core';
import { Observable, Subscription, first } from 'rxjs';

export interface IZvViewDataSource {
  readonly contentVisible: Signal<boolean>;
  readonly contentBlocked: Signal<boolean>;
  readonly exception: Signal<IZvException | null>;
  connect(): void;
  disconnect(): void;
}

export interface ZvViewDataSourceOptions<TParams, TData> {
  loadTrigger$: Observable<TParams>;
  loadFn: (params: TParams) => Observable<TData>;
  keepLoadStreamOpen?: boolean;
}

export class ZvViewDataSource<TParams, TData> implements IZvViewDataSource {
  private readonly loading = signal<boolean>(false);
  private readonly blockView = signal<boolean>(false);

  private connected = false;
  private params: TParams | null = null;
  private loadingSub = Subscription.EMPTY;
  private connectSub = Subscription.EMPTY;

  constructor(private options: ZvViewDataSourceOptions<TParams, TData>) {}

  public readonly result = signal<TData | null>(null);
  public readonly exception = signal<IZvException | null>(null);
  public readonly contentVisible = signal<boolean>(false);
  public readonly contentBlocked = computed(() => this.loading() || this.blockView());

  public connect() {
    if (this.connected) {
      throw new Error('ViewDataSource is already connected.');
    }
    this.connectSub = this.options.loadTrigger$.subscribe((params) => {
      this.connected = true;
      this.params = params;
      this.loadData(params);
    });
  }

  public updateData() {
    if (!this.connected) {
      throw new Error('ViewDataSource is not connected.');
    }
    this.loadData(this.params!);
  }

  public disconnect(): void {
    this.connectSub.unsubscribe();
    this.loadingSub.unsubscribe();
  }

  public setViewBlocked(value: boolean) {
    this.blockView.set(value);
  }

  private loadData(params: TParams) {
    this.loadingSub.unsubscribe();
    this.loading.set(true);
    this.contentVisible.set(true);
    this.exception.set(null);

    let load$ = this.options.loadFn(params);
    if (!this.options.keepLoadStreamOpen) {
      load$ = load$.pipe(first());
    }
    this.loadingSub = load$.subscribe({
      next: (result) => {
        this.loading.set(false);
        this.result.set(result);
      },
      error: (err) => {
        this.loading.set(false);
        this.result.set(null);
        this.contentVisible.set(false);
        this.exception.set({
          errorObject: err,
          alignCenter: true,
          icon: 'sentiment_very_dissatisfied',
        });
      },
    });
  }
}
