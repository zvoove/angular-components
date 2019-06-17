import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-select-with-custom-template',
  template: `
    <h2>Custom options template</h2>
    <mat-form-field>
      <mat-label>select</mat-label>
      <ps-select [(ngModel)]="ngModelValue" [dataSource]="items">
        <ng-container *psSelectOptionTemplate="let item">
          <span [style.color]="item.value" class="asdf">{{ item.label }}</span>
        </ng-container>
      </ps-select>
    </mat-form-field>
    value: {{ ngModelValue | json }}
    <ul>
      <li>The selectable items should be in the color of their name</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWithCustomTemplateComponent {
  public items = [
    {
      value: `red`,
      label: `Red`,
    },
    {
      value: `green`,
      label: `Green`,
    },
    {
      value: `blue`,
      label: `Blue`,
    },
  ];
  public ngModelValue: any = null;
}
