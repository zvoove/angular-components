import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DefaultPsSelectDataSource } from '@prosoft/components/select';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-select-with-error-in-datasource',
  template: `
    <h2>Error while loading items</h2>
    <span [formGroup]="form">
      <mat-form-field style="display:inline-block">
        <mat-label>select</mat-label>
        <ps-select formControlName="select" [dataSource]="dataSource"></ps-select>
      </mat-form-field>
    </span>
    value: {{ form.value.select | json }}<br />
    <ul>
      <li>Initially '??? (ID: idx)' should be selected</li>
      <li>When opening the dropdown, there sould be a red item with 'Failed to load items' that is not selectable</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWithErrorInDataSourceComponent {
  public dataSource = new DefaultPsSelectDataSource({
    mode: 'id',
    labelKey: 'a',
    idKey: 'b',
    items: () => throwError('Failed to load items'),
  });
  public form = new FormGroup({
    select: new FormControl('idx'),
  });
}
