import { ChangeDetectionStrategy, Component, computed, input, viewChild } from '@angular/core';
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
  styleUrl: './table-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class ZvTableActionsComponent<T> {
  public root = input<boolean>(true);
  public actions = input.required<IZvTableAction<T>[]>();
  public items = input.required<T[]>();
  public loading = input<boolean>(false);

  public showIcon = computed(() => this.root() || this.actions().some((x) => x.icon));

  public menu = viewChild.required<MatMenu>('menu');
}
