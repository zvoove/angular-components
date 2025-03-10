import { ChangeDetectionStrategy, Component, ViewEncapsulation, afterNextRender, effect, input, signal, viewChild } from '@angular/core';

import type { ElementRef } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'zv-block-ui',
  templateUrl: './block-ui.component.html',
  styleUrls: ['./block-ui.component.scss'],
  host: {
    '[class.zv-block-ui__clickthrough]': 'clickthrough()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatProgressSpinner],
})
export class ZvBlockUi {
  public readonly blocked = input.required<boolean>();
  public readonly spinnerText = input('');
  public readonly clickthrough = input(false);

  public readonly spinnerDiameter = signal(20); // start with min width and then see if we can increase it in updateSpinner

  public readonly contentNode = viewChild<ElementRef<HTMLDivElement>>('content');

  constructor() {
    afterNextRender({ read: () => this.updateSpinner() });
    effect(() => {
      if (this.blocked()) {
        this.updateSpinner();
      }
    });
  }

  private updateSpinner() {
    const nativeEl = this.contentNode()!.nativeElement;
    const minDimension = Math.min(nativeEl.offsetWidth, nativeEl.offsetHeight);
    const textSpace = this.spinnerText() ? 20 : 0;
    const newDiameter = Math.max(Math.min(minDimension - textSpace, 100), 20);
    setTimeout(() => this.spinnerDiameter.set(newDiameter), 0);
  }
}
