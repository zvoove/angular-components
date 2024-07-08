import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IZvException } from '@zvoove/components/core';
import { IZvViewDataSource, ZvViewModule } from '@zvoove/components/view';
import { BehaviorSubject, Observable, Subject, Subscription, of } from 'rxjs';
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
  templateUrl: './view-demo.component.html',
  styleUrls: ['./view-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatCardModule, MatCheckboxModule, ReactiveFormsModule, FormsModule, MatButtonModule, ZvViewModule, JsonPipe],
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
