import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-select-with-ng-model',
  template: `
    <h2>ngModel</h2>
    <div>
      <button (click)="random()">select random value</button>
    </div>
    <mat-form-field>
      <mat-label>ngModel bound</mat-label>
      <zv-select [(ngModel)]="ngModelValue" [dataSource]="items"></zv-select>
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
  public items: any[] = Array.from(Array(50).keys()).map((i) => ({
    value: `id${i}`,
    label: `Item ${i}`,
  }));
  public ngModelValue: any = 'id11';

  constructor(private cd: ChangeDetectorRef) {}

  public random() {
    const idx = Math.floor(Math.random() * this.items.length);
    this.ngModelValue = this.items[idx].value;
    this.cd.markForCheck();
  }
}
