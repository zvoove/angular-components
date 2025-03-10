import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatIconAnchor, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger } from '@angular/material/menu';
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
  styleUrl: './table-row-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconAnchor,
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    ZvTableActionsComponent,
    MatTooltip,
    NgTemplateOutlet,
    RouterLink,
    ZvTableActionsToRenderPipe,
    ZvTableActionTypePipe,
  ],
})
export class ZvTableRowActionsComponent<T> {
  public readonly root = input<boolean>(true);
  public readonly item = input.required<T>();
  public readonly actions = input.required<IZvTableAction<T>[]>();
  public readonly loadActionsFn = input<(data: T, actions: IZvTableAction<T>[]) => Observable<IZvTableAction<T>[]>>();
  public readonly openMenuFn =
    input<(data: T, actions: IZvTableAction<T>[]) => Observable<IZvTableAction<T>[]> | IZvTableAction<T>[] | null>();
  public readonly moreMenuThreshold = input<number>();

  public readonly loadedActions = signal<IZvTableAction<T>[] | null>(null);
  public readonly loading = signal<boolean>(false);

  public readonly itemAsArray = computed(() => [this.item()]);
  public readonly combinedActions = computed(() => this.loadedActions() ?? this.actions());

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
