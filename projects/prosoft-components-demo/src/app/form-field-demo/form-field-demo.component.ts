import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { PsFormFieldSubscriptType } from '@prosoft/components/form-field';
import { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
  selector: 'app-reference-column',
  template: `
    <ps-form-field [appearance]="appearance" [hint]="hint" [hintToggle]="hintToggle" [subscriptType]="subscriptType">
      <mat-label>Referenz Column</mat-label>
      <input matInput [(ngModel)]="value" type="text" />
    </ps-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferenceColumnComponent {
  @Input() public subscriptType: PsFormFieldSubscriptType = 'single-line';
  @Input() public hintToggle = false;
  @Input() public hint = 'hint text';
  @Input() public appearance: MatFormFieldAppearance = 'legacy';
  public value = '';
}

@Component({
  selector: 'app-form-field-demo',
  templateUrl: './form-field-demo.component.html',
  styleUrls: ['./form-field-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class FormFieldDemoComponent {
  public subscriptType: PsFormFieldSubscriptType = 'single-line';
  public hintToggle = false;
  public hintText = 'hint text';
  public appearance: MatFormFieldAppearance = 'outline';
  public asyncLabel$ = of('Custom Label');
  public ctrlCountNumbers = Array(7).fill(1);
  public value = '';
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(value: boolean) {
    for (const ctrlName in this.form.controls) {
      if (!this.form.controls.hasOwnProperty(ctrlName)) {
        continue;
      }
      const ctrl = this.form.controls[ctrlName];
      if (value) {
        ctrl.disable();
      } else {
        ctrl.enable();
      }
    }
    this._disabled = value;
    this.cd.markForCheck();
  }
  public customLabel = true;
  public get error(): boolean {
    return this._error;
  }
  public set error(value: boolean) {
    for (const ctrlName in this.form.controls) {
      if (!this.form.controls.hasOwnProperty(ctrlName)) {
        continue;
      }
      const ctrl = this.form.controls[ctrlName];
      if (value) {
        ctrl.setValidators(() => ({
          error1: 'error value 1',
          error2: 'this is a very long error is will be truncated in this demo',
        }));
      } else {
        ctrl.setValidators(null);
      }
      ctrl.updateValueAndValidity();
    }
    this._error = value;
    this.cd.markForCheck();
  }

  public form = new FormGroup({
    select: new FormControl('item_ok'),
    checkbox: new FormControl(null),
    radio: new FormControl(null),
    prefixText: new FormControl(null),
    slider: new FormControl(null),
    psSelect: new FormControl(1),
  });

  public showControls = true;
  public psSelectData = [
    { key: 1, label: 'Option 1' },
    { key: 2, label: 'Option 2' },
    { key: 3, label: 'Option 3' },
  ];

  private _disabled = false;
  private _error = false;

  constructor(private cd: ChangeDetectorRef) {
    for (const ctrlName in this.form.controls) {
      if (!this.form.controls.hasOwnProperty(ctrlName)) {
        continue;
      }
      const ctrl = this.form.controls[ctrlName];
      (ctrl as any).psLabel = ctrlName;
    }
  }
}
