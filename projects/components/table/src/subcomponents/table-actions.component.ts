import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { IPsTableIntlTexts } from '@prosoft/components/core';

import { IPsTableAction } from '../models';

@Component({
  selector: 'ps-table-actions',
  templateUrl: './table-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsTableActionsComponent {
  @Input() public actions: IPsTableAction<unknown>[];
  @Input() public items: unknown[];
  @Input() public refreshable: boolean;
  @Input() public settingsEnabled: boolean;
  @Input() public intl: IPsTableIntlTexts;

  @Output() public refreshData = new EventEmitter<void>();
  @Output() public showSettings = new EventEmitter<void>();

  @ViewChild('menu', { static: true }) menu: MatMenu;
}
