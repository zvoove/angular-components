import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-select-with-ng-model',
  template: `
    <h2>ngModel</h2>
    <mat-form-field>
      <mat-label>ngModel bound</mat-label>
      <ps-select [(ngModel)]="ngModelValue" [dataSource]="items"></ps-select>
    </mat-form-field>
    value: {{ ngModelValue | json }}
    <ul>
      <li>'Item 11'/'id11' should be initially selected</li>
      <li>Changing the selection should update the selected value</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWithNgModelComponent {
  public items: any[] = Array.from(Array(50).keys()).map(i => ({
    value: `id${i}`,
    label: `Item ${i}`,
  }));
  public ngModelValue: any = 'id11';
}
