import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BasePsFormService, IPsFormError, IPsFormErrorData, PsFormBaseModule } from '@prosoft/components/form-base';
import { PsFormErrorsModule } from '@prosoft/components/form-errors';
import { Observable, of } from 'rxjs';
import { FormErrorsDemoComponent } from './form-errors-demo.component';

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
  declarations: [FormErrorsDemoComponent],
  imports: [
    ReactiveFormsModule,
    PsFormBaseModule.forRoot(DemoPsFormsService),
    PsFormErrorsModule,
    RouterModule.forChild([
      {
        path: '',
        component: FormErrorsDemoComponent,
      },
    ]),
  ],
  providers: [],
})
export class FormErrorsDemoModule {}
