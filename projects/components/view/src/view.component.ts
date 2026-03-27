import { ChangeDetectionStrategy, Component, effect, input, ViewEncapsulation } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { ZvErrorMessagePipe } from '@zvoove/components/core';
import { IZvViewDataSource } from './view-data-source';

@Component({
  selector: 'zv-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ZvBlockUi, MatCard, MatIcon, ZvErrorMessagePipe],
})
export class ZvView {
  public readonly dataSource = input.required<IZvViewDataSource>();

  constructor() {
    effect((onCleanup) => {
      const ds = this.dataSource();
      ds.connect();
      onCleanup(() => ds.disconnect());
    });
  }
}
