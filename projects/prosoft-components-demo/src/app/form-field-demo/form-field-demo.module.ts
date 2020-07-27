import { CommonModule } from '@angular/common';
import { NgModule, Injectable } from '@angular/core';
import { FormControl, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { PsFormBaseModule } from '@prosoft/components/form-base';
import { PsFormFieldModule } from '@prosoft/components/form-field';
import { DemoPsFormsService } from '../common/demo-ps-form-service';
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
    PsFormBaseModule.forRoot(DemoPsFormsService),
    PsFormFieldModule,
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
  ],
  declarations: [FormFieldDemoComponent, ReferenceColumnComponent],
  providers: [{ provide: ErrorStateMatcher, useClass: InvalidErrorStateMatcher }],
})
export class FormFieldDemoModule {}
