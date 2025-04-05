import { afterRenderEffect, ChangeDetectionStrategy, Component, input, Signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ThemePalette } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { ZvButtonColors } from '@zvoove/components/core';
import { IZvActionButtonDataSource } from './action-button-data-source';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatButtonModule, MatProgressSpinner, MatTooltip],
})
export class ZvActionButtonComponent {
  public readonly dataSource = input.required<IZvActionButtonDataSource>();
  public readonly icon = input<string | null>(null);
  public readonly color = input<ZvButtonColors | null | undefined>(null);
  public readonly disabled = input<boolean>(false);

  private readonly _tooltip = viewChild(MatTooltip);

  constructor() {
    afterRenderEffect(() => {
      if (this.dataSource().showError()) {
        this._tooltip()?.show(0);
      }
    });
  }
}
