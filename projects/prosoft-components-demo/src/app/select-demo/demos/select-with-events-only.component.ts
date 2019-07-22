import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-select-with-events-only',
  template: `
    <h2>Event output only (no form)</h2>
    <mat-form-field>
      <mat-label>selectionChange only</mat-label>
      <ps-select [dataSource]="items" (selectionChange)="onSelectionChange($event)"></ps-select>
    </mat-form-field>
    change event values: {{ values | json }}
    <ul>
      <li>Initialliy no event should be fired</li>
      <li>When changing the selection, the id of the selected item should be added to the events values above</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWithEventsOnlyComponent {
  public items: any[] = Array.from(Array(50).keys()).map(i => ({
    value: `id${i}`,
    label: `Item ${i}`,
  }));
  public values: string[] = [];

  public onSelectionChange(event: MatSelectChange) {
    this.values.push(event.value);
  }
}
