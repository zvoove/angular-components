import { afterRenderEffect, ChangeDetectionStrategy, Component, effect, ElementRef, input, signal, Signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ThemePalette } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ZvErrorMessagePipe } from '@zvoove/components/core';
import { IZvActionDataSource } from './action-data-source';
import { MatTooltip } from '@angular/material/tooltip';

export interface IZvActionButton {
  label: string;
  color: ThemePalette | null;
  icon: string;
  dataCy: string;
  isDisabled?: Signal<boolean>;
}

@Component({
  selector: 'zv-action-button',
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZvErrorMessagePipe, MatIcon, MatButtonModule, MatProgressSpinner, MatTooltip],
})
export class ZvActionButtonComponent {
  public readonly actionDs = input.required<IZvActionDataSource>();
  public readonly button = input.required<IZvActionButton>();
  public readonly contentNode = viewChild.required<ElementRef<HTMLDivElement>>('content');
  public readonly spinnerDiameter = signal(20);
  public readonly showSuccessIcon = signal(false);

  constructor() {
    afterRenderEffect(() => {
      if (this.actionDs().pending()) {
        this.spinnerDiameter.set(this.contentNode().nativeElement.offsetHeight);
      }
    });
    effect(() => {
      if (this.actionDs().succeeded()) {
        this.showSuccessIcon.set(true);
        setTimeout(() => {
          this.showSuccessIcon.set(false);
        }, 2000);
      }
    });
  }
}
