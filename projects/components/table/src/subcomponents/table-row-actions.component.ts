import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { IZvTableAction } from '../models';
import { isObservable, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, finalize, take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'zv-table-row-actions',
  templateUrl: './table-row-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZvTableRowActionsComponent implements OnChanges, OnDestroy {
  @Input() public root = true;
  @Input() public actions: IZvTableAction<any>[];
  @Input() public loadActionsFn: (data: any, actions: IZvTableAction<any>[]) => Observable<IZvTableAction<any>[]>;
  @Input() public openMenuFn: (
    data: any,
    actions: IZvTableAction<any>[]
  ) => Observable<IZvTableAction<any>[]> | IZvTableAction<any>[] | null;
  @Input() public moreMenuThreshold: number;
  @Input() public item: any;

  public itemAsArray: any[];
  public loading: boolean;

  private _loadActionsFnSubscription: Subscription;
  private _ngUnsubscribe$ = new Subject<void>();

  constructor(private cd: ChangeDetectorRef) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.item) {
      this.itemAsArray = [this.item];
    }

    if (changes.loadActionsFn) {
      this.updateLoadActionsFnSubscription();
    }
  }

  public ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }

  public onMenuButtonClicked() {
    if (!this.openMenuFn) {
      return;
    }

    const openMenuFnResult = this.openMenuFn(this.item, [...this.actions]);

    if (isObservable(openMenuFnResult)) {
      this.loading = true;
      openMenuFnResult
        .pipe(
          take(1),
          finalize(() => (this.loading = false)),
          catchError((err) => {
            this.loading = false;
            return of(err);
          }),
          takeUntil(this._ngUnsubscribe$)
        )
        .subscribe((newActions) => {
          this.updateActions(newActions);
          this.loading = false;
        });
    } else if (openMenuFnResult && Array.isArray(openMenuFnResult)) {
      this.updateActions(openMenuFnResult);
    }
  }

  private updateLoadActionsFnSubscription(): void {
    if (!this.loadActionsFn) {
      return;
    }

    this._loadActionsFnSubscription?.unsubscribe();

    this._loadActionsFnSubscription = this.loadActionsFn(this.item, [...this.actions])
      .pipe(
        catchError((err) => {
          this.loading = false;
          return of(err);
        }),
        takeUntil(this._ngUnsubscribe$)
      )
      .subscribe((newActions) => {
        this.updateActions(newActions);
      });
  }

  private updateActions(newActions: IZvTableAction<any>[]): void {
    this.actions = newActions && newActions.length > 0 ? newActions : this.actions;
    this.cd.markForCheck();
  }
}
