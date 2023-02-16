import { Injectable } from '@angular/core';
import { BaseZvFormService, IZvFormError, IZvFormErrorData } from '@zvoove/components/form-base';
import { Observable, of } from 'rxjs';

@Injectable()
export class DemoZvFormsService extends BaseZvFormService {
  public getLabel(formControl: any): Observable<string> {
    return formControl.zvLabel ? of(formControl.zvLabel) : null;
  }
  protected mapDataToError(errorData: IZvFormErrorData[]): Observable<IZvFormError[]> {
    return of(
      errorData.map((data) => ({
        errorText: `${data.controlPath} - ${data.errorKey} - ${JSON.stringify(data.errorValue)}`,
        data: data,
      }))
    );
  }
}
