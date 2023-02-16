import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { IZvTableAction } from '../models';

@Component({
  selector: 'zv-table-row-actions',
  templateUrl: './table-row-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZvTableRowActionsComponent implements OnChanges {
  @Input() public root = true;
  @Input() public actions: IZvTableAction<any>[];
  @Input() public actionsTemplate: TemplateRef<any> | null = null;
  @Input() public moreMenuThreshold: number;
  @Input() public item: any;

  public itemAsArray: any[];

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.item) {
      this.itemAsArray = [this.item];
    }
  }
}
