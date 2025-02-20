import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import {
  ZV_NATIVE_DATE_FORMATS,
  ZV_NATIVE_TIME_FORMATS,
  ZvNativeDateAdapter,
  ZvNativeDateTimeAdapter,
  ZvNativeTimeAdapter,
  provideDateTimeAdapters,
  provideDateTimeFormats,
} from '@zvoove/components/core';
import { ZvDateTimeInput } from '@zvoove/components/date-time-input';
import { ZvFormService } from '@zvoove/components/form-base';
import { ZvFormField, ZvFormFieldSubscriptType } from '@zvoove/components/form-field';
import { DefaultZvSelectService, ZvSelectModule, ZvSelectService } from '@zvoove/components/select';
import { of } from 'rxjs';
import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { InvalidErrorStateMatcher } from '../common/invalid-error-state-matcher';

@Component({
  selector: 'app-reference-column',
  template: `
    <zv-form-field [hint]="hint" [hintToggle]="hintToggle" [subscriptType]="subscriptType">
      <mat-label>Referenz Column</mat-label>
      <input matInput [(ngModel)]="value" type="text" [required]="required" />
    </zv-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule, ZvFormField],
})
export class ReferenceColumnComponent {
  @Input() public subscriptType: ZvFormFieldSubscriptType = 'single-line';
  @Input() public hintToggle = false;
  @Input() public hint = 'hint text';
  @Input() public required = false;
  public value = '';
}

@Component({
  selector: 'app-form-field-demo',
  templateUrl: './form-field-demo.component.html',
  styleUrls: ['./form-field-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ZvFormField,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
    ReferenceColumnComponent,
    MatIconModule,
    MatSliderModule,
    MatRadioModule,
    MatButtonModule,
    ZvSelectModule,
    ZvDateTimeInput,
    MatDatepickerModule,
    AsyncPipe,
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: InvalidErrorStateMatcher },
    provideDateTimeAdapters(ZvNativeDateTimeAdapter, ZvNativeDateAdapter, ZvNativeTimeAdapter),
    provideDateTimeFormats(ZV_NATIVE_DATE_FORMATS, ZV_NATIVE_TIME_FORMATS),
    { provide: ZvFormService, useClass: DemoZvFormsService },
    { provide: ZvSelectService, useClass: DefaultZvSelectService },
  ],
})
export class FormFieldDemoComponent {
  public subscriptType: ZvFormFieldSubscriptType = 'single-line';
  public hintToggle = false;
  public hintText = 'hint text';
  public asyncLabel$ = of('Custom Label');
  public ctrlCountNumbers = Array(7)
    .fill(1)
    .map((_, idx) => idx);
  public value = '';
  public required = false;

  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(value: boolean) {
    for (const ctrlName in this.form.controls) {
      if (!Object.prototype.hasOwnProperty.call(this.form.controls, ctrlName)) {
        continue;
      }
      const ctrl = this.form.controls[ctrlName as keyof typeof this.form.controls];
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
      if (!Object.prototype.hasOwnProperty.call(this.form.controls, ctrlName)) {
        continue;
      }
      const ctrl = this.form.controls[ctrlName as keyof typeof this.form.controls];
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
    zvSelect: new FormControl(1),
    zvDateTimeInput: new FormControl(null),
  });

  public showControls = true;
  public zvSelectData = [
    { key: 1, label: 'Option 1' },
    { key: 2, label: 'Option 2' },
    { key: 3, label: 'Option 3' },
  ];

  private _disabled = false;
  private _error = false;

  constructor(private cd: ChangeDetectorRef) {
    for (const ctrlName in this.form.controls) {
      if (!Object.prototype.hasOwnProperty.call(this.form.controls, ctrlName)) {
        continue;
      }
      const ctrl = this.form.controls[ctrlName as keyof typeof this.form.controls];
      (ctrl as any).zvLabel = ctrlName;
    }
  }
}
