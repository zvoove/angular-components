import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BasePsFormService, IPsFormErrorData, PsFormError, PsFormModule } from '@prosoft/components/form';
import { Observable, of } from 'rxjs';
import { FormErrorsDemoComponent } from './form-errors-demo.component';

export class DemoPsErrorsService extends BasePsFormService {
  public getLabel(formControl: any): Observable<string> {
    return formControl.psLabel ? of(formControl.psLabel) : null;
  }
  protected mapDataToError(errorData: IPsFormErrorData[]): Observable<PsFormError[]> {
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
    PsFormModule.forRoot(DemoPsErrorsService),
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
