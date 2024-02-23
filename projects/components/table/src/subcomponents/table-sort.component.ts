import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatMiniFabButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { IZvTableSort, IZvTableSortDefinition } from '../models';

@Component({
  selector: 'zv-table-sort',
  templateUrl: './table-sort.component.html',
  styleUrls: ['./table-sort.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatFormField, MatLabel, MatSelect, MatOption, MatMiniFabButton, MatIcon],
})
export class ZvTableSortComponent {
  @Input() public sortColumn: string;
  @Input() public sortDirection: 'asc' | 'desc';
  @Input() public sortDefinitions: IZvTableSortDefinition[] = [];
  @Output() public readonly sortChanged = new EventEmitter<IZvTableSort>();

  public onSortColumnChange(event: MatSelectChange) {
    if (this.sortColumn !== event.value) {
      this.sortColumn = event.value;
      this.emitChange();
    }
  }

  public onSortDirectionChange(dir: 'asc' | 'desc') {
    if (this.sortDirection !== dir) {
      this.sortDirection = dir;
      this.emitChange();
    }
  }

  private emitChange() {
    this.sortChanged.emit({
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection,
    });
  }
}
