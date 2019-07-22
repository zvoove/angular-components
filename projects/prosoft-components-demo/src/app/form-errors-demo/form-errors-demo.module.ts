import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BasePsFormErrorsService, IPsFormErrorData, PsFormError, PsFormErrorsModule } from '@prosoft/components/form-errors';
import { Observable, of } from 'rxjs';
import { FormErrorsDemoComponent } from './form-errors-demo.component';

export class DemoPsFormErrorsService extends BasePsFormErrorsService {
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
    PsFormErrorsModule.forRoot(DemoPsFormErrorsService),
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
