import { NgIf } from '@angular/common';
import {
  AfterRenderPhase,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ViewEncapsulation,
  afterNextRender,
  effect,
  input,
  signal,
} from '@angular/core';

import type { ElementRef } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'zv-block-ui',
  templateUrl: './block-ui.component.html',
  styleUrls: ['./block-ui.component.scss'],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[class.zv-block-ui__clickthrough]': 'clickthrough()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [NgIf, MatProgressSpinner],
})
export class ZvBlockUi {
  public blocked = input.required<boolean>();
  public spinnerText = input('');
  public clickthrough = input(false);

  public spinnerDiameter = signal(20); // start with min width and then see if we can increase it in updateSpinner

  @ViewChild('content', { static: true }) public contentNode: ElementRef<HTMLElement>;

  constructor() {
    afterNextRender(() => this.updateSpinner(), { phase: AfterRenderPhase.Read });
    effect(() => {
      if (this.blocked()) {
        this.updateSpinner();
      }
    });
  }

  private updateSpinner() {
    const nativeEl = this.contentNode.nativeElement;
    const minDimension = Math.min(nativeEl.offsetWidth, nativeEl.offsetHeight);
    const textSpace = this.spinnerText() ? 20 : 0;
    const newDiameter = Math.max(Math.min(minDimension - textSpace, 100), 20);
    setTimeout(() => this.spinnerDiameter.set(newDiameter), 0);
  }
}
