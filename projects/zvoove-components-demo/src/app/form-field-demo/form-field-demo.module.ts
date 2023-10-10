import { CommonModule } from '@angular/common';
import { Injectable, NgModule } from '@angular/core';
import { FormControl, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
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
import { ZvFormBaseModule } from '@zvoove/components/form-base';
import { ZvFormFieldModule } from '@zvoove/components/form-field';
import { DefaultZvSelectService, ZvSelectModule } from '@zvoove/components/select';
import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { InvalidErrorStateMatcher } from '../common/invalid-error-state-matcher';
import { FormFieldDemoComponent, ReferenceColumnComponent } from './form-field-demo.component';

@Injectable()
export class CustomErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null, _: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ZvFormBaseModule.forRoot(DemoZvFormsService),
    ZvFormFieldModule,
    ZvSelectModule.forRoot(DefaultZvSelectService),
    RouterModule.forChild([
      {
        path: '',
        component: FormFieldDemoComponent,
      },
    ]),
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSliderModule,
    MatDatepickerModule,
    ZvDateTimeInput,
  ],
  declarations: [FormFieldDemoComponent, ReferenceColumnComponent],
  providers: [
    { provide: ErrorStateMatcher, useClass: InvalidErrorStateMatcher },
    provideDateTimeAdapters(ZvNativeDateTimeAdapter, ZvNativeDateAdapter, ZvNativeTimeAdapter),
    provideDateTimeFormats(ZV_NATIVE_DATE_FORMATS, ZV_NATIVE_TIME_FORMATS),
  ],
})
export class FormFieldDemoModule {}
