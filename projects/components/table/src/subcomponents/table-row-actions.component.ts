import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { NEVER, Observable, isObservable, of } from 'rxjs';
import { catchError, finalize, first, switchMap } from 'rxjs/operators';
import { IZvTableAction } from '../models';
import { ZvTableActionsToRenderPipe } from '../pipes/table-actions-to-render.pipe';
import { ZvTableActionTypePipe } from '../pipes/table-actions-type.pipe';
import { ZvTableActionsComponent } from './table-actions.component';

@Component({
  selector: 'zv-table-row-actions',
  templateUrl: './table-row-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    ZvTableActionsComponent,
    MatTooltip,
    NgTemplateOutlet,
    MatMenuItem,
    RouterLink,
    ZvTableActionsToRenderPipe,
    ZvTableActionTypePipe,
  ],
})
export class ZvTableRowActionsComponent<T> {
  public root = input<boolean>(true);
  public item = input.required<T>();
  public actions = input.required<IZvTableAction<T>[]>();
  public loadActionsFn = input<(data: T, actions: IZvTableAction<T>[]) => Observable<IZvTableAction<T>[]>>();
  public openMenuFn = input<(data: T, actions: IZvTableAction<T>[]) => Observable<IZvTableAction<T>[]> | IZvTableAction<T>[] | null>();
  public moreMenuThreshold = input<number>();

  public loadedActions = signal<IZvTableAction<T>[] | null>(null);
  public loading = signal<boolean>(false);

  public itemAsArray = computed(() => [this.item()]);
  public combinedActions = computed(() => this.loadedActions() ?? this.actions());

  private _destroyRef = inject(DestroyRef);

  constructor() {
    toObservable(this.loadActionsFn)
      .pipe(
        switchMap((loadActionsFn) => {
          if (!loadActionsFn) {
            return NEVER;
          }
          this.loading.set(true);
          return loadActionsFn(this.item(), [...this.actions()]);
        }),
        takeUntilDestroyed()
      )
      .subscribe((actions) => {
        this.loading.set(false);
        this.loadedActions.set(actions);
      });
  }

  public onMenuButtonClicked() {
    if (!this.openMenuFn()) {
      return;
    }

    const openMenuFnResult = this.openMenuFn()!(this.item(), [...this.actions()]);

    if (isObservable(openMenuFnResult)) {
      this.loading.set(true);
      openMenuFnResult
        .pipe(
          first(),
          finalize(() => this.loading.set(false)),
          catchError((err) => of(err)),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe((newActions) => {
          this.loadedActions.set(newActions as IZvTableAction<T>[]);
        });
    } else if (openMenuFnResult && Array.isArray(openMenuFnResult)) {
      this.loadedActions.set(openMenuFnResult);
    }
  }
}
