import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IZvException } from '@zvoove/components/core';
import { IZvViewDataSource, ZvView } from '@zvoove/components/view';
import { Observable, Subscription, of } from 'rxjs';
import { delay, first, map } from 'rxjs/operators';

interface ZvViewDataSourceOptions<TParams, TData> {
  loadTrigger$: Observable<TParams>;
  loadFn: (params: TParams) => Observable<TData>;
  keepLoadStreamOpen?: boolean;
}

class DemoZvViewDataSource<TParams, TData> implements IZvViewDataSource {
  private loading = signal<boolean>(false);
  private blockView = signal<boolean>(false);

  private connected = false;
  private params: TParams | null = null;
  private loadingSub = Subscription.EMPTY;
  private connectSub = Subscription.EMPTY;

  constructor(private options: ZvViewDataSourceOptions<TParams, TData>) {}

  public result = signal<TData | null>(null);
  public exception = signal<IZvException | null>(null);
  public contentVisible = signal<boolean>(false);
  public contentBlocked = computed(() => this.loading() || this.blockView());

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

interface ZvViewDemoItemData {
  loadCount: number;
  time: Date;
}
interface ZvViewDemoLogData {
  type: string;
  params: number;
}

@Component({
  selector: 'app-view-demo',
  templateUrl: './view-demo.component.html',
  styleUrls: ['./view-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatCheckboxModule, ReactiveFormsModule, FormsModule, MatButtonModule, ZvView, JsonPipe],
})
export class ViewDemoComponent {
  public loadError = false;
  public counter = signal(0);
  public logs = signal<ZvViewDemoLogData[]>([]);
  public item = signal<ZvViewDemoItemData | null>(null);

  public dataSource = new DemoZvViewDataSource({
    loadTrigger$: of(null), // could be route params in a real application
    loadFn: () => {
      this.logs.update((arr) => {
        arr.push({ type: 'load', params: this.counter() });
        return arr;
      });
      return of({
        loadCount: this.counter(),
        time: new Date(),
      } as ZvViewDemoItemData).pipe(
        delay(1000),
        map((x) => {
          if (this.loadError) {
            throw new Error('this is the server error (loading)');
          }

          this.item.set(x);
          return x;
        })
      );
    },
  });

  public reload() {
    this.counter.update((val) => val + 1);
    this.dataSource.updateData();
  }
}
