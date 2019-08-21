import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormControl, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { BasePsFormService, IPsFormError, IPsFormErrorData, PsFormBaseModule } from '@prosoft/components/form-base';
import { PsFormFieldModule } from '@prosoft/components/form-field';
import { PsSliderModule } from '@prosoft/components/slider';
import { Observable, of } from 'rxjs';
import { SliderDemoComponent } from './slider-demo.component';

export class CustomErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null, _: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}

export class DemoPsFormsService extends BasePsFormService {
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

@NgModule({
  declarations: [SliderDemoComponent],
  imports: [
    PsFormBaseModule.forRoot(DemoPsFormsService),
    CommonModule,
    PsFormFieldModule,
    PsSliderModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    PsFormFieldModule,
    RouterModule.forChild([
      {
        path: '',
        component: SliderDemoComponent,
      },
    ]),
  ],
  providers: [{ provide: ErrorStateMatcher, useClass: CustomErrorStateMatcher }],
})
export class SliderDemoModule {}
