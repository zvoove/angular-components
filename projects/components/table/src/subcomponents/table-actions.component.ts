import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { IZvTableIntlTexts } from '@zvoove/components/core';

import { IZvTableAction } from '../models';

@Component({
  selector: 'zv-table-actions',
  templateUrl: './table-actions.component.html',
  styleUrls: ['./table-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZvTableActionsComponent implements OnChanges {
  @Input() public root = true;
  @Input() public actions: IZvTableAction<unknown>[];
  @Input() public items: unknown[];
  @Input() public refreshable: boolean;
  @Input() public loading: boolean;
  @Input() public settingsEnabled: boolean;
  @Input() public intl: IZvTableIntlTexts;

  @Output() public readonly refreshData = new EventEmitter<void>();
  @Output() public readonly showSettings = new EventEmitter<void>();

  public showIcon: boolean;

  @ViewChild('menu', { static: true }) menu: MatMenu;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.root || changes.actions) {
      this.showIcon = this.root || this.actions?.some((x) => x.icon);
    }
  }
}
