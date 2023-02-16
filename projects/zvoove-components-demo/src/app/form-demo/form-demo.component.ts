import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-form-demo',
  template: `
    <mat-card class="app-form-demo__settings">
      <mat-form-field>
        <mat-select [(ngModel)]="demoType">
          <mat-option [value]="'dataSource'">dataSource</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-card>
    <ng-container [ngSwitch]="demoType">
      <app-form-data-source-demo *ngSwitchCase="'dataSource'"></app-form-data-source-demo>
    </ng-container>
  `,
  styles: [
    `
      .app-form-demo__settings {
        margin-bottom: 1em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDemoComponent {
  public demoType = 'dataSource';
}
