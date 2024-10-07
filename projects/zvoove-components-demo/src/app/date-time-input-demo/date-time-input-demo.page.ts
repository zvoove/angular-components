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
import { CodeFiles } from '../common/code-files/code-files.component';
import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { InvalidErrorStateMatcher } from '../common/invalid-error-state-matcher';
import { allSharedImports } from '../common/shared-imports';

@Component({
  selector: 'app-date-time-input-demo',
  templateUrl: './date-time-input-demo.page.html',
  styleUrls: ['./date-time-input-demo.page.scss'],
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

  public getCodeFiles(type: 'value' | 'ngmodel' | 'form'): CodeFiles[] {
    return [
      {
        filename: 'app.component.html',
        code: this.getHtmlCodeSnippet(type),
      },
      {
        filename: 'app.component.ts',
        code: this.getTsCodeSnippet(type),
      },
    ];
  }

  public getHtmlCodeSnippet(type: 'value' | 'ngmodel' | 'form'): string {
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

  public getTsCodeSnippet(type: 'value' | 'ngmodel' | 'form'): string {
    let code = `
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ZvDateTimeInput } from '@zvoove/components/date-time-input';
__IMPORTS__

@Component({
  selector: 'app-component',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatDatepickerModule,
    ZvDateTimeInput,
  ],
})
export class AppComponent {
  __ERROR_STATE_MATCHER__
  __VALUE__
}
`;

    if (type === 'value' || type === 'ngmodel') {
      code = code.replace('__VALUE__', 'value: Date | null = null;');
      code = code.replace('__IMPORTS__', '');
    } else {
      code = code.replace(
        '__VALUE__',
        `control = new FormControl<Date | null>(null${this.validatorRequired ? ', {validators: [Validators.required]}' : ''});${
          this.disabled
            ? `
  constructor(){
    this.control.disable();
  }`
            : ''
        }`
      );
      code = code.replace('__IMPORTS__', `import { FormControl } from '@angular/forms';`);
    }
    if (this.errorStateMatcher) {
      code = code.replace('__ERROR_STATE_MATCHER__', `errorStateMatcher = { isErrorState: () => true, };`);
    } else {
      code = code.replace('__ERROR_STATE_MATCHER__', '');
    }

    return code;
  }

  providersCode = `
import {
  ZV_NATIVE_DATE_FORMATS,
  ZV_NATIVE_TIME_FORMATS,
  ZvNativeDateAdapter,
  ZvNativeDateTimeAdapter,
  ZvNativeTimeAdapter,
  provideDateTimeAdapters,
  provideDateTimeFormats,
} from '@zvoove/components/core';

// ...
providers: [
  provideDateTimeAdapters(ZvNativeDateTimeAdapter, ZvNativeDateAdapter, ZvNativeTimeAdapter),
  provideDateTimeFormats(ZV_NATIVE_DATE_FORMATS, ZV_NATIVE_TIME_FORMATS),
],
  `;
  importsCode = `
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ZvDateTimeInput } from '@zvoove/components/date-time-input';

// ...
imports: [
  MatDatepickerModule,
  ZvDateTimeInput,
],
  `;
}
