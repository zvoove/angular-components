import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IZvException } from '@zvoove/components/core';
import { IZvViewDataSource } from '@zvoove/components/view';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';

export interface ZvViewDataSourceOptions<TParams, TData> {
  loadTrigger$: Observable<TParams>;
  loadFn: (params: TParams) => Observable<TData>;
}

class DemoZvViewDataSource<TParams, TData> implements IZvViewDataSource {
  public get contentVisible(): boolean {
    return !this._hasLoadError;
  }
  public get contentBlocked(): boolean {
    return this._loading || this._blockView;
  }
  public exception: IZvException;

  private _loading = false;
  private _hasLoadError = false;
  private _blockView = false;
  private stateChanges$ = new Subject<void>();

  private _loadingSub = Subscription.EMPTY;
  private _connectSub = Subscription.EMPTY;
  constructor(private options: ZvViewDataSourceOptions<TParams, TData>) {}

  public connect(): Observable<void> {
    this._connectSub = this.options.loadTrigger$.subscribe((params) => {
      this.loadData(params);
    });
    return this.stateChanges$;
  }

  public disconnect(): void {
    this._connectSub.unsubscribe();
    this._loadingSub.unsubscribe();
  }

  public setViewBlocked(value: boolean) {
    this._blockView = value;
    this.stateChanges$.next();
  }

  private loadData(params: TParams) {
    this._loadingSub.unsubscribe();
    this._loading = true;
    this._hasLoadError = false;
    this.exception = null;
    this.stateChanges$.next();

    this._loadingSub = this.options
      .loadFn(params)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this._loading = false;
          this.stateChanges$.next();
        },
        error: (err) => {
          this._loading = false;
          this._hasLoadError = true;
          this.exception = {
            errorObject: err,
            alignCenter: true,
            icon: 'sentiment_very_dissatisfied',
          };
          this.stateChanges$.next();
        },
      });
  }
}

@Component({
  selector: 'app-view-demo',
  template: `
    <mat-card class="app-view-data-source-demo__settings">
      <mat-checkbox [(ngModel)]="loadError">load error</mat-checkbox>
      <button mat-flat-button type="button" color="accent" (click)="reload()">reload</button>
    </mat-card>
    <div class="app-form-data-source-demo__grid">
      <zv-view [dataSource]="dataSource">
        <mat-card>
          <pre>{{ item | json }}</pre>
        </mat-card>
        <mat-card style="height: 500px; margin-top: 1em;">dummy card</mat-card>
      </zv-view>
      <mat-card class="app-view-data-source-demo__logs">
        <div *ngFor="let log of logs" class="app-view-data-source-demo__log-item">{{ log | json }}</div>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .app-view-data-source-demo__settings {
        margin-bottom: 1em;
      }

      .app-view-data-source-demo__settings mat-checkbox {
        margin: 1em;
      }

      .app-view-data-source-demo__grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-gap: 1em;
      }

      .app-view-data-source-demo__logs {
        margin-top: 1em;
      }

      .app-view-data-source-demo__log-item {
        margin-bottom: 0.25em;
        padding-bottom: 0.25em;
        border-bottom: 1px solid #ccc;
        font-size: 0.95em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDemoComponent {
  public loadError = false;
  public counter = 0;
  public logs: any[] = [];
  public item: any;

  public loadTrigger$ = new BehaviorSubject(this.counter);

  public dataSource = new DemoZvViewDataSource({
    loadTrigger$: this.loadTrigger$, // could be route params in a real application
    loadFn: (count) => {
      this.logs.push({ type: 'load', params: count });
      return of({
        loadCount: count,
        time: new Date(),
      }).pipe(
        delay(1000),
        map((x) => {
          if (this.loadError) {
            throw new Error('this is the server error (loading)');
          }

          this.item = x;
          return x;
        })
      );
    },
  });

  public reload() {
    this.loadTrigger$.next(++this.counter);
  }
}
