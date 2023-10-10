import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { InvalidErrorStateMatcher } from '../common/invalid-error-state-matcher';
import { allSharedImports } from '../common/shared-imports';

@Component({
  selector: 'app-date-time-input-demo',
  templateUrl: './date-time-input-demo.component.html',
  styleUrls: ['./date-time-input-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [allSharedImports, MatDatepickerModule, ZvDateTimeInput],
  providers: [
    { provide: ZvFormService, useClass: DemoZvFormsService },
    { provide: ErrorStateMatcher, useClass: InvalidErrorStateMatcher },
    provideDateTimeAdapters(ZvNativeDateTimeAdapter, ZvNativeDateAdapter, ZvNativeTimeAdapter),
    provideDateTimeFormats(ZV_NATIVE_DATE_FORMATS, ZV_NATIVE_TIME_FORMATS),
  ],
})
export class DateTimeInputDemoComponent {
  public value: Date | null = null;
  public model: Date | null = null;
  public control = new FormControl<Date | null>(null);
  public form = new FormGroup({
    control: this.control,
  });

  public id = '';
  public required = false;
  public disabled = false;
  public errorStateMatcher: ErrorStateMatcher = null;

  public validatorRequired = false;
  public useErrorStateMatcher = false;

  public now = () => new Date();

  constructor() {}

  public onValidatorChange() {
    if (this.validatorRequired) {
      this.control.addValidators(Validators.required);
    } else {
      this.control.removeValidators(Validators.required);
    }
  }

  public onUseErrorStateMatcherChange() {
    if (this.useErrorStateMatcher) {
      this.errorStateMatcher = {
        isErrorState: () => true,
      };
    } else {
      this.errorStateMatcher = null;
    }
  }

  public setValues(value: Date | null) {
    this.value = value;
    this.model = value;
    this.control.patchValue(value);
  }

  public onDisabledChanged() {
    if (this.disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  public getCodeSnippet(type: 'value' | 'ngmodel' | 'form') {
    const attributes = [];
    if (type === 'value') {
      attributes.push('[(value)]="value"');
    } else if (type === 'ngmodel') {
      attributes.push('[(ngModel)]="value"');
    } else {
      attributes.push('formControlName="control"');
    }
    if (this.id) {
      attributes.push(`[id]="'${this.id}'"`);
    }
    if (this.required) {
      attributes.push(`[required]="${this.required}"`);
    }
    if (this.disabled && type != 'form') {
      attributes.push(`[disabled]="${this.disabled}"`);
    }
    if (this.errorStateMatcher) {
      attributes.push(`[errorStateMatcher]="${this.errorStateMatcher ? 'errorStateMatcher' : 'null'}"`);
    }
    return `
<zv-form-field>
  <mat-label>Your date time</mat-label>
  <zv-date-time-input ${attributes.join(' ')} [matDatepicker]="datepickerRef"></zv-date-time-input>
  <mat-datepicker-toggle matSuffix [for]="datepickerRef"></mat-datepicker-toggle>
  <mat-datepicker #datepickerRef></mat-datepicker>
</zv-form-field>
    `;
  }
}
