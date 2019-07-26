import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ControlValueAccessor } from '@angular/forms';
import { objectToKeyValueArray } from '@prosoft/components/utils';
import { merge, Observable } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { IPsFormErrorData, IPsFormError } from './models';
import { MatFormFieldControl } from '@angular/material/form-field';
import { getControlType } from './helpers';

@Injectable()
export abstract class PsFormService {
  public abstract tryDetectRequired: boolean;
  public abstract getLabel(formControl: FormControl): Observable<string> | null;

  /**
   * Returns the type of the control. Most of the time the type is the same as the selector.
   *
   * @param control The control class (MatSlider, MatSelect, ...)
   */
  public abstract getControlType(control: any): string | null;
  public abstract getControlErrors(control: FormControl): Observable<IPsFormError[]>;
  public abstract getFormErrors(form: FormGroup, includeControls: boolean): Observable<IPsFormError[]>;
}

export abstract class BasePsFormService extends PsFormService {
  public options = {
    debounceTime: 100,
  };
  public tryDetectRequired = true;

  public getControlType = getControlType;

  public getControlErrors(control: FormControl): Observable<IPsFormError[]> {
    return this.getErrors(control, true);
  }

  public getFormErrors(form: FormGroup, includeControls: boolean): Observable<IPsFormError[]> {
    return this.getErrors(form, includeControls);
  }

  protected abstract mapDataToError(errorData: IPsFormErrorData[]): Observable<IPsFormError[]>;

  private getErrors(control: AbstractControl, includeControls: boolean): Observable<IPsFormError[]> {
    const update$ = this.createUpdateTrigger(control);

    return update$.pipe(
      map(() => this.getErrorInfo(control, includeControls)),
      switchMap(errorData => this.mapDataToError(errorData))
    );
  }

  private createUpdateTrigger(control: AbstractControl): Observable<any> {
    return merge(control.valueChanges, control.statusChanges).pipe(
      startWith(null as any),
      debounceTime(this.options.debounceTime)
    );
  }

  private getErrorInfo(control: AbstractControl, includeControls: boolean = false): IPsFormErrorData[] {
    return this.getControlErrorInfoInternal(control, '', includeControls);
  }

  private getControlErrorInfoInternal(control: AbstractControl, controlPath: string, includeControls: boolean): IPsFormErrorData[] {
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

  private createFormErrorData(error: { key: string; value: any }, control: AbstractControl, controlPath: string): IPsFormErrorData {
    return {
      controlPath: controlPath,
      errorKey: error.key,
      errorValue: error.value,
      isControl: control instanceof FormControl,
    };
  }
}
