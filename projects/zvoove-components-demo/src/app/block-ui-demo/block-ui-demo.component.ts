import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-block-ui-demo',
  template: `
    <mat-checkbox [(ngModel)]="blocked">blocked</mat-checkbox>
    <mat-form-field style="display:block">
      <mat-label>Text for the block ui</mat-label>
      <input type="text" matInput [(ngModel)]="spinnerText" />
    </mat-form-field>

    <div style="height: 1em;"></div>
    <zv-block-ui [blocked]="blocked" [clickthrough]="true">
      <div>this block-ui is clickthrough</div>
      <button type="button" mat-raised-button color="primary">clickable</button>
    </zv-block-ui>

    <div style="height: 1em;"></div>
    <zv-block-ui [blocked]="blocked">
      <div>this block-ui is NOT clickthrough</div>
      <button type="button" mat-raised-button color="primary">NOT clickable while blocked</button>
    </zv-block-ui>

    <div style="height: 1em;"></div>
    <div style="height: 50px; overflow: auto;">
      <zv-block-ui [blocked]="blocked">
        <div style="height: 50px;">this box with overflow auto will be blocked without flickering</div>
      </zv-block-ui>
    </div>

    <div style="height: 1em;"></div>
    <div style="height: 50px; overflow: auto;">
      <zv-block-ui [blocked]="blocked" [spinnerText]="spinnerText">
        <div style="height: 50px;">this box with overflow auto will be blocked without flickering</div>
      </zv-block-ui>
    </div>

    <div style="height: 1em;"></div>
    <zv-block-ui [blocked]="blocked" [spinnerText]="spinnerText">
      <mat-card> this will be blocked </mat-card>
    </zv-block-ui>

    <div style="height: 1em;"></div>
    <zv-block-ui [blocked]="blocked" [spinnerText]="spinnerText">
      <mat-card style="height: 30vh"> this will also be blocked </mat-card>
    </zv-block-ui>

    <div style="height: 1em;"></div>
    <zv-block-ui [blocked]="blocked" [spinnerText]="spinnerText">
      <mat-card style="height: 300vh"> this will also be blocked to show position sticky </mat-card>
    </zv-block-ui>
    <div style="height: 100vh"></div>
  `,
  styles: [
    `
      app-block-ui-demo .mat-card {
        background-color: #ccc;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BlockUiDemoComponent {
  public blocked = true;
  public spinnerText = 'some custom text that will be displayed while the view is blocked';
}
