import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, model, output } from '@angular/core';
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
  imports: [MatFormField, MatLabel, MatSelect, MatOption, MatMiniFabButton, MatIcon],
})
export class ZvTableSortComponent {
  public readonly sortColumn = model.required<string | null>();
  public readonly sortDirection = model.required<'asc' | 'desc' | null>();
  public readonly sortDefinitions = input<IZvTableSortDefinition[]>([]);
  public readonly sortChanged = output<IZvTableSort>();

  public onSortColumnChange(event: MatSelectChange) {
    if (this.sortColumn() !== event.value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.sortColumn.set(event.value);
      this.emitChange();
    }
  }

  public onSortDirectionChange(dir: 'asc' | 'desc') {
    if (this.sortDirection() !== dir) {
      this.sortDirection.set(dir);
      this.emitChange();
    }
  }

  private emitChange() {
    this.sortChanged.emit({
      sortColumn: this.sortColumn(),
      sortDirection: this.sortDirection(),
    });
  }
}
