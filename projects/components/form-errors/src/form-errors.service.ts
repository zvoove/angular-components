import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { objectToKeyValueArray } from '@prosoft/components/utils';
import { merge, Observable } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { IPsFormErrorData, PsFormError } from './models';

@Injectable()
export abstract class PsFormErrorsService {
  public abstract getErrors(form: FormGroup, includeControls: boolean): Observable<PsFormError[]>;
}

export abstract class BasePsFormErrorsService extends PsFormErrorsService {
  public getErrors(form: FormGroup, includeControls: boolean): Observable<PsFormError[]> {
    const update$ = this.createUpdateTrigger(form);

    return update$.pipe(
      map(() => this.getFormErrorInfo(form, includeControls)),
      switchMap(errorData => this.mapDataToError(errorData))
    );
  }

  protected abstract mapDataToError(errorData: IPsFormErrorData[]): Observable<PsFormError[]>;

  protected createUpdateTrigger(form: FormGroup): Observable<any> {
    return merge(form.valueChanges, form.statusChanges).pipe(
      startWith(null),
      debounceTime(100)
    );
  }

  protected getFormErrorInfo(control: FormGroup, includeControls: boolean = false): IPsFormErrorData[] {
    return this.getControlErrorInfoInternal(control, '', includeControls);
  }

  protected getControlErrorInfoInternal(control: AbstractControl, controlPath: string, includeControls: boolean): IPsFormErrorData[] {
    const errors: IPsFormErrorData[] = [];

    if (control instanceof FormGroup || control instanceof FormArray) {
      for (const childName in control.controls) {
        if (!control.controls.hasOwnProperty(childName)) {
          continue;
        }
        const childControl = (<{ [key: string]: AbstractControl }>control.controls)[childName];
        if (!(childControl instanceof FormControl) || includeControls) {
          errors.push(
            ...this.getControlErrorInfoInternal(childControl, controlPath ? controlPath + '.' + childName : childName, includeControls)
          );
        }
      }
    }

    if (control.errors) {
      errors.push(...objectToKeyValueArray(control.errors).map(error => this.createFormErrorData(error, control, controlPath)));
    }

    return errors;
  }

  protected createFormErrorData(error: { key: string; value: any }, control: AbstractControl, controlPath: string): IPsFormErrorData {
    return {
      controlPath: controlPath,
      errorKey: error.key,
      errorValue: error.value,
      isControl: control instanceof FormControl,
    };
  }
}
