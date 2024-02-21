import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

import { NgTemplateOutlet } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { IZvTableAction } from '../models';
import { ZvTableActionsToRenderPipe } from '../pipes/table-actions-to-render.pipe';
import { ZvTableActionTypePipe } from '../pipes/table-actions-type.pipe';

@Component({
  selector: 'zv-table-actions',
  templateUrl: './table-actions.component.html',
  styleUrls: ['./table-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatMenu,
    ZvBlockUi,
    MatMenuContent,
    MatMenuItem,
    NgTemplateOutlet,
    RouterLink,
    MatMenuTrigger,
    MatIcon,
    ZvTableActionsToRenderPipe,
    ZvTableActionTypePipe,
  ],
})
export class ZvTableActionsComponent implements OnChanges {
  @Input() public root = true;
  @Input() public actions: IZvTableAction<unknown>[];
  @Input() public items: unknown[];
  @Input() public refreshable: boolean;
  @Input() public loading: boolean;
  @Input() public settingsEnabled: boolean;

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
