import { ChangeDetectionStrategy, Component, input, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ThemePalette } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { ZvErrorMessagePipe } from '@zvoove/components/core';
import { IZvActionDataSource } from './action-data-source';

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
  imports: [ZvErrorMessagePipe, ZvBlockUi, MatIcon, MatButtonModule],
})
export class ZvActionButtonComponent {
  public readonly actionDs = input.required<IZvActionDataSource>();
  public readonly button = input.required<IZvActionButton>();
}
