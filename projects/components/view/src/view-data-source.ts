import { computed, Resource, ResourceStatus, signal, Signal } from '@angular/core';
import { IZvException } from '@zvoove/components/core';
import { first, Observable, of, Subscription } from 'rxjs';

export interface IZvViewDataSource {
  readonly contentVisible: Signal<boolean>;
  readonly contentBlocked: Signal<boolean>;
  readonly error: Signal<unknown | null>;
  readonly errorIcon: Signal<string | null>;
  connect?(): void;
  disconnect?(): void;
}

export interface ZvViewDataSourceOptions<TData, TParams = null> {
  loadTrigger$?: Observable<TParams>;
  loadFn: (params: TParams) => Observable<TData>;
  keepLoadStreamOpen?: boolean;
}

export class ZvViewDataSource<TData, TParams = null> implements IZvViewDataSource, Resource<TData> {
  private blockView = signal<boolean>(false);

  private connected = false;
  private params: TParams | null = null;
  private loadingSub = Subscription.EMPTY;
  private loadtriggerSub = Subscription.EMPTY;

  constructor(private options: ZvViewDataSourceOptions<TData, TParams>) {}

  public status = signal<ResourceStatus>(ResourceStatus.Idle);
  public value = signal<TData>(null!);
  public error = signal<unknown>(null);
  public errorIcon = signal<string>('sentiment_very_dissatisfied');
  public contentVisible = signal<boolean>(false);
  public contentBlocked = computed(() => this.isLoading() || this.blockView());
  public readonly isLoading = computed(() => this.status() === ResourceStatus.Loading || this.status() === ResourceStatus.Reloading);
  public hasValue(): this is Resource<Exclude<TData, undefined>> {
    return this.value() !== undefined;
  }

  /** @deprecated Use value() */
  public result = computed(() => this.value());

  /** @deprecated Use error() */
  public exception = computed<IZvException | null>(() => (this.error() ? { errorObject: this.error(), icon: this.errorIcon() } : null));

  /** @deprecated Use reload() */
  public updateData() {
    this.reload();
  }

  public connect() {
    if (this.connected) {
      throw new Error('ViewDataSource is already connected.');
    }
    this.loadtriggerSub = (this.options.loadTrigger$ ?? of<TParams>(null!)).subscribe((params) => {
      this.connected = true;
      this.params = params;
      this.loadData(params);
    });
  }

  public reload() {
    if (!this.connected) {
      throw new Error('ViewDataSource is not connected.');
    }
    this.loadData(this.params!);
    return true;
  }

  public disconnect(): void {
    this.loadtriggerSub.unsubscribe();
    this.loadingSub.unsubscribe();
  }

  public setViewBlocked(value: boolean) {
    this.blockView.set(value);
  }

  private loadData(params: TParams) {
    this.loadingSub.unsubscribe();
    this.status.set(ResourceStatus.Loading);
    this.contentVisible.set(true);
    this.error.set(null);

    let load$ = this.options.loadFn(params);
    if (!this.options.keepLoadStreamOpen) {
      load$ = load$.pipe(first());
    }
    this.loadingSub = load$.subscribe({
      next: (result) => {
        this.status.set(ResourceStatus.Resolved);
        this.value.set(result);
      },
      error: (err) => {
        this.status.set(ResourceStatus.Error);
        this.value.set(undefined!);
        this.contentVisible.set(false);
        this.error.set(err);
      },
    });
  }
}

export class SignalZvViewDataSource<TData> implements IZvViewDataSource, Resource<TData> {
  public readonly resource: Resource<TData>;
  public readonly contentVisible = computed<boolean>(() => this.status() == ResourceStatus.Error);
  public readonly contentBlocked = computed<boolean>(() => this.isLoading() || this.blockView());
  public readonly errorIcon = signal<string>('sentiment_very_dissatisfied');

  public readonly value: Signal<TData>;
  public readonly status: Signal<ResourceStatus>;
  public readonly error: Signal<unknown>;
  public readonly isLoading: Signal<boolean>;
  public hasValue(): this is Resource<Exclude<TData, undefined>> {
    return this.resource.hasValue();
  }

  private blockView = signal<boolean>(false);

  constructor(options: { resource: Resource<TData> }) {
    this.resource = options.resource;
    this.value = this.resource.value.bind(this.resource);
    this.status = this.resource.status.bind(this.resource);
    this.error = this.resource.error.bind(this.resource);
    this.isLoading = this.resource.isLoading.bind(this.resource);
  }

  public reload() {
    return this.resource.reload();
  }

  public setViewBlocked(value: boolean) {
    this.blockView.set(value);
  }
}
