import { ChangeDetectionStrategy, Component, input, Signal } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ZvErrorMessagePipe } from '@zvoove/components/core';
import { MatLabel } from '@angular/material/input';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ZvActionDataSource } from './action-data-source';

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
  imports: [MatLabel, ZvErrorMessagePipe, ZvBlockUi, MatIcon, MatButtonModule],
})
export class ZvActionButtonComponent<T> {
  public actionDs = input.required<ZvActionDataSource<T>>();
  public button = input.required<IZvActionButton>();
}
