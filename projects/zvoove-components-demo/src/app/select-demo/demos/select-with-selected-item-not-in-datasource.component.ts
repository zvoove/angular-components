import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-select-with-selected-item-not-in-datasource',
  template: `
    <h2>Initially selected Item is not in DataSource</h2>
    <span [formGroup]="form">
      <mat-form-field style="display:inline-block">
        <mat-label>select</mat-label>
        <zv-select formControlName="select" [dataSource]="items$"></zv-select>
      </mat-form-field>
    </span>
    value: {{ form.value.select | json }}<br />
    <ul>
      <li>Initially '??? (ID: idx)' should be selected</li>
      <li>When first opening the dropdown '??? (ID: idx)' should be the first item and marked as selected</li>
      <li>the filter should work</li>
      <li>
        When filtering for 'item' the '??? (ID: idx)' entry should not be visible in the dropdown. When closing the dropdown without
        clearing the filter, '??? (ID: idx)' should still be thr selected item in the selectbox and no flickering should occur.
      </li>
      <li>When selecting a different item, '??? (ID: idx)' should vanish from the selectable items</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWithSelectedItemNotInDataSourceComponent {
  public items$: Observable<any[]> = of(
    Array.from(Array(50).keys()).map((i) => ({
      value: `id${i}`,
      label: `Item ${i}`,
    }))
  );
  public form = new FormGroup({
    select: new FormControl('idx'),
  });
}
