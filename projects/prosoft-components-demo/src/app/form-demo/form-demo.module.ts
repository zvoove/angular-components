import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { IPsFormCancelParams, PsFormActionService, PsFormModule } from '@prosoft/components/form';
import { BasePsFormService, IPsFormError, IPsFormErrorData, PsFormBaseModule } from '@prosoft/components/form-base';
import {
  IPsFormLoadErrorParams,
  IPsFormLoadSuccessParams,
  IPsFormSaveErrorParams,
  IPsFormSaveSuccessParams,
} from '@prosoft/components/form/src/models';
import { PsSavebarModule } from '@prosoft/components/savebar';
import { Observable, of, Subject } from 'rxjs';
import { FormDemoComponent } from './form-demo.component';

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

export class DemoPsFormActionService extends PsFormActionService {
  public static logStream$ = new Subject<string>();
  public defaultLoadSuccessHandler(params: IPsFormLoadSuccessParams): void {
    this.log('action service load success handler', params);
  }
  public defaultLoadErrorHandler(params: IPsFormLoadErrorParams): void {
    this.log('action service load error handler', params);
  }
  public defaultSaveSuccessHandler(params: IPsFormSaveSuccessParams): void {
    this.log('action service save success handler', params);
  }
  public defaultSaveErrorHandler(params: IPsFormSaveErrorParams): void {
    this.log('action service save error handler', params);
  }
  public defaultCancelHandler(params: IPsFormCancelParams): void {
    this.log('action service cancel handler', params);
  }

  private log(message: string, params: any) {
    console.log(message, params);
    DemoPsFormActionService.logStream$.next(message);
  }
}

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PsFormBaseModule.forRoot(DemoPsFormsService),
    PsSavebarModule,
    PsFormModule,
    RouterModule.forChild([
      {
        path: '',
        component: FormDemoComponent,
      },
    ]),
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule,
  ],
  declarations: [FormDemoComponent],
  providers: [{ provide: PsFormActionService, useClass: DemoPsFormActionService }],
})
export class FormDemoModule {}
