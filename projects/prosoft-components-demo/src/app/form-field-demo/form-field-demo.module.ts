import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
import { BasePsFormService, IPsFormErrorData, IPsFormError, PsFormModule } from '@prosoft/components/form';
import { Observable, of } from 'rxjs';
import { FormFieldDemoComponent, ReferenceColumnComponent } from './form-field-demo.component';

export class DemoPsErrorsService extends BasePsFormService {
  public getLabel(formControl: any): Observable<string> {
    return formControl.psLabel ? of(formControl.psLabel) : null;
  }
  protected mapDataToError(errorData: IPsFormErrorData[]): Observable<IPsFormError[]> {
    return of(
      errorData.map(data => ({
        errorText: `${data.controlPath} - ${data.errorKey} - ${JSON.stringify(data.errorValue)}`,
        data: data,
      }))
    );
  }
}

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
    PsFormModule.forRoot(DemoPsErrorsService),
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
  providers: [{ provide: ErrorStateMatcher, useClass: CustomErrorStateMatcher }],
})
export class FormFieldDemoModule {}
