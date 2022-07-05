import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DefaultPsSelectDataSource } from '@prosoft/components/select';
import { NEVER } from 'rxjs';

@Component({
  selector: 'app-select-with-endless-loading-datasource',
  template: `
    <h2>Endless Loading DataSource</h2>
    <span [formGroup]="form">
      <mat-form-field style="display:inline-block">
        <mat-label>select</mat-label>
        <ps-select formControlName="select" [dataSource]="dataSource"></ps-select>
      </mat-form-field>
    </span>
    value: {{ form.value.select | json }}<br />
    <ul>
      <li>Initially '??? (ID: idx)' should be selected</li>
      <li>When opening the dropdown, there sould be a loading indicator</li>
      <li>the filter should work</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWithEndlessLoadingDataSourceComponent {
  public dataSource = new DefaultPsSelectDataSource({ mode: 'id', labelKey: 'a', idKey: 'b', items: () => NEVER });
  public form = new FormGroup({
    select: new FormControl('idx'),
  });
}
