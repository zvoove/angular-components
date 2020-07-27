import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'app-select-with-multiselect',
  template: `
    <h2>Multiselect</h2>
    <div>
      <mat-checkbox [(ngModel)]="showToggleAll">show toggle all</mat-checkbox>
    </div>
    <span [formGroup]="form">
      <mat-form-field style="display:inline-block">
        <mat-label>select</mat-label>
        <ps-select formControlName="select" [dataSource]="items$" [multiple]="true" [showToggleAll]="showToggleAll"></ps-select>
      </mat-form-field>
    </span>
    value: {{ form.value.select | json }}<br />
    <ul>
      <li>Multiple items should be selectable</li>
      <li>On mouseover the selected items should be shown in a tooltip</li>
      <li>When selecting a item, the dropdown should stay open and shouldnt reorder the items</li>
      <li>When closing and reopening the dropdown, all selected items should be at the top</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWithMultiselectComponent {
  public showToggleAll = true;
  public items$: Observable<any[]> = of(
    Array.from(Array(500).keys()).map(i => ({
      value: `id${i}`,
      label: `Item ${i}`,
    }))
  );
  public form = new FormGroup({
    select: new FormControl(),
  });
}
