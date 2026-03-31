import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, input, signal } from '@angular/core';

import { NgTemplateOutlet } from '@angular/common';
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
    '[class.zv-table-row-detail--open]': 'show()',
    '(transitionend)': 'onTransitionEnd()',
  },
})
export class TableRowDetailComponent<T> {
  public readonly rowDetail = input<ZvTableRowDetail>();
  public readonly element = input<T>();
  public readonly show = input<boolean>();

  /** Expanded Items, die sichtbar sind (wird beim Start der Aufklapp-Animation und am Ende der Zuklapp-Animation gesetzt) */
  public readonly renderContent = signal(false);

  constructor() {
    effect(() => {
      if (this.show()) {
        this.renderContent.set(true);
      }
    });
  }

  onTransitionEnd() {
    if (!this.show()) {
      this.renderContent.set(false);
    }
  }
}
