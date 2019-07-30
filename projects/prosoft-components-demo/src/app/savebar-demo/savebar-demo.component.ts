import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-savebar-demo',
  template: `
    <ps-savebar
      [form]="form"
      [canStepFwd]="true"
      [canStepBack]="true"
      (save)="onButtonClick('save')"
      (saveAndClose)="onButtonClick('saveAndClose')"
      (cancel)="onButtonClick('cancel')"
      (step)="onButtonClick($event < 0 ? 'prev' : 'next')"
    >
      <mat-card>
        <form [formGroup]="form">
          <mat-form-field>
            <mat-label>Input 1</mat-label>
            <input type="text" matInput formControlName="input1" />
          </mat-form-field>
          <div style="height: 100vh;"></div>
          <mat-form-field>
            <mat-label>Input 2</mat-label>
            <input type="text" matInput formControlName="input2" />
          </mat-form-field>
        </form>
      </mat-card>
      <ng-container *psSavebarRightContent>
        <button mat-stroked-button type="button" (click)="onButtonClick('custom')">
          Custom Button
        </button>
      </ng-container>
    </ps-savebar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SavebarDemoComponent {
  public form = new FormGroup(
    {
      input1: new FormControl('a'),
      input2: new FormControl('b'),
    },
    [
      (formGroup: AbstractControl) => {
        return formGroup.value.input1 === formGroup.value.input2 ? null : { equal: 'input1 and input2 must be equal' };
      },
    ]
  );

  public onButtonClick(buttonName: string) {
    alert(buttonName + ' button clicked');
  }
}
