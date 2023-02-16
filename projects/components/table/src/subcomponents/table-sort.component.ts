import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { IZvTableIntlTexts } from '@zvoove/components/core';
import { IZvTableSortDefinition } from '../models';

@Component({
  selector: 'zv-table-sort',
  template: `
    <mat-form-field>
      <mat-label>{{ intl.sortLabel }}</mat-label>
      <mat-select [value]="sortColumn" (selectionChange)="onSortColumnChange($event)">
        <mat-option *ngFor="let sortDefinition of sortDefinitions" [value]="sortDefinition.prop">{{
          sortDefinition.displayName
        }}</mat-option>
      </mat-select>
    </mat-form-field>
    <button
      mat-mini-fab
      type="button"
      (click)="onSortSirectionChange('desc')"
      class="zv-table-sort__dir-button"
      [class.zv-table-sort__dir-button--inactive]="sortDirection === 'asc'"
    >
      <mat-icon>arrow_downward</mat-icon>
    </button>
    <button
      mat-mini-fab
      type="button"
      (click)="onSortSirectionChange('asc')"
      class="zv-table-sort__dir-button"
      [class.zv-table-sort__dir-button--inactive]="sortDirection === 'desc'"
    >
      <mat-icon>arrow_upward</mat-icon>
    </button>
  `,
  styles: [
    `
      zv-table-sort {
        display: grid;
        grid-template-columns: 1fr min-content min-content;
      }

      .zv-table-sort__dir-button {
        width: 28px;
        height: 28px;
        line-height: 28px;
        margin-top: 16px;
        margin-left: 0.2em;
      }

      .zv-table-sort__dir-button .mat-button-wrapper {
        padding: 0;
      }

      .zv-table-sort__dir-button--inactive {
        background-color: transparent !important;
        color: black !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZvTableSortComponent {
  @Input() public intl: IZvTableIntlTexts;
  @Input() public sortColumn: string;
  @Input() public sortDirection: 'asc' | 'desc';
  @Input() public sortDefinitions: IZvTableSortDefinition[] = [];
  @Output() public readonly sortChanged = new EventEmitter<{ sortColumn: string; sortDirection: 'asc' | 'desc' }>();

  public onSortColumnChange(event: MatSelectChange) {
    if (this.sortColumn !== event.value) {
      this.sortColumn = event.value;
      this.emitChange();
    }
  }

  public onSortSirectionChange(dir: 'asc' | 'desc') {
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
