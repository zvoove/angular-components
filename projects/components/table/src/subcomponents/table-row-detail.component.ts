import { ChangeDetectionStrategy, Component, ViewEncapsulation, afterNextRender, input, signal } from '@angular/core';

import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { delay, of, switchMap, tap } from 'rxjs';
import { ZvTableRowDetail } from '../directives/table.directives';

@Component({
  selector: 'zv-table-row-detail',
  templateUrl: './table-row-detail.component.html',
  styleUrls: ['./table-row-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet],
  host: {
    '[class.zv-table-row-detail]': 'true',
    '[class.zv-table-row-detail--expanding-init]': 'show() && animInit()',
    '[class.zv-table-row-detail--expanding-to]': 'show() && animTo()',
    '[class.zv-table-row-detail--expanded]': 'show() && animDone()',
    '[class.zv-table-row-detail--collapsing-init]': '!show() && animInit()',
    '[class.zv-table-row-detail--collapsing-to]': '!show() && animTo()',
    '[class.zv-table-row-detail--collapsed]': '!show() && animDone()',
  },
})
export class TableRowDetailComponent<T> {
  public readonly rowDetail = input<ZvTableRowDetail>();
  public readonly element = input<T>();
  public readonly show = input<boolean>();

  /** Expanded Items, die sichtbar sind (wird beim Start der Aufklapp-Animation und am Ende der Zuklapp-Animation gesetzt) */
  public readonly renderContent = signal(false);
  public readonly animInit = signal(false);
  public readonly animTo = signal(false);
  public readonly animDone = signal(true);

  constructor() {
    afterNextRender({ read: () => {} });

    const cancelableDelay = (ms: number) => switchMap((v) => of(v).pipe(delay(ms)));
    toObservable(this.show)
      .pipe(
        tap((show) => {
          if (show) {
            this.renderContent.set(true);
          }
          this.animInit.set(true);
          this.animTo.set(false);
          this.animDone.set(false);
        }),
        cancelableDelay(1),
        tap(() => {
          this.animTo.set(true);
        }),
        cancelableDelay(250),
        tap((show) => {
          if (!show) {
            this.renderContent.set(false);
          }
          this.animInit.set(false);
          this.animTo.set(false);
          this.animDone.set(true);
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }
}
