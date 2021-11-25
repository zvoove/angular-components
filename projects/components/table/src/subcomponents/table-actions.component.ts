import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { IPsTableIntlTexts } from '@prosoft/components/core';

import { IPsTableAction } from '../models';

@Component({
  selector: 'ps-table-actions',
  templateUrl: './table-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsTableActionsComponent implements OnChanges {
  @Input() public root = true;
  @Input() public actions: IPsTableAction<unknown>[];
  @Input() public items: unknown[];
  @Input() public refreshable: boolean;
  @Input() public settingsEnabled: boolean;
  @Input() public intl: IPsTableIntlTexts;

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
