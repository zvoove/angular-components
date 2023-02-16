import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-select-with-custom-template',
  template: `
    <h2>Custom options template</h2>
    <mat-form-field>
      <mat-label>select</mat-label>
      <zv-select [(ngModel)]="ngModelValue" [dataSource]="items" [panelClass]="panelNgClass">
        <ng-container *zvSelectTriggerTemplate="let item">
          color: <span [style.color]="item.value" class="asdf">{{ item.viewValue }}</span>
        </ng-container>
        <ng-container *zvSelectOptionTemplate="let item">
          <div>color:</div>
          <span [style.color]="item.value.color" [style.font-size]="item.value.size" class="asdf">{{ item.label }}</span>
        </ng-container>
      </zv-select>
    </mat-form-field>
    value: {{ ngModelValue | json }}
    <ul>
      <li>The selectable items should be in the color of their name</li>
    </ul>
  `,
  styles: [
    `
      .app-select-with-custom-template__custom-panel.mat-select-panel .mat-option {
        height: auto;
        min-height: 3em;
        line-height: 1.5em;
        padding-top: 3px;
        padding-bottom: 3px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SelectWithCustomTemplateComponent {
  public items = [
    {
      value: {
        color: `red`,
        size: '3em',
      },
      label: `Red`,
    },
    {
      value: {
        color: `green`,
        size: '2em',
      },
      label: `Green`,
    },
    {
      value: {
        color: `blue`,
        size: '1.5em',
      },
      label: `Blue`,
    },
  ];
  public ngModelValue: any = null;
  public panelNgClass = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'app-select-with-custom-template__custom-panel': true,
  };
}
