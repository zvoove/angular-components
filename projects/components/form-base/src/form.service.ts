import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { objectToKeyValueArray } from '@zvoove/components/utils';
import { merge, Observable, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { getControlType } from './helpers';
import { IZvFormError, IZvFormErrorData } from './models';

@Injectable({ providedIn: 'root' })
export abstract class ZvFormService {
  public abstract tryDetectRequired: boolean;
  public abstract getLabel(formControl: FormControl): Observable<string> | null;

  /**
   * Returns the type of the control. Most of the time the type is the same as the selector.
   *
   * @param control The control class (MatSlider, MatSelect, ...)
   */
  public abstract getControlType(control: unknown): string | null;
  public abstract getControlErrors(control: FormControl): Observable<IZvFormError[]>;
  public abstract getFormErrors(form: FormGroup, includeControls: boolean): Observable<IZvFormError[]>;
}

export abstract class BaseZvFormService extends ZvFormService {
  public options = {
    debounceTime: 100,
    includeControlsDefault: false,
  };
  public tryDetectRequired = true;

  public getControlType = getControlType;

  public getControlErrors(control: FormControl): Observable<IZvFormError[]> {
    return this.getErrors(control, true, 'control');
  }

  public getFormErrors(form: FormGroup, includeControls: boolean | null): Observable<IZvFormError[]> {
    if (includeControls == null) {
      includeControls = this.options.includeControlsDefault;
    }
    return this.getErrors(form, includeControls, 'form');
  }

  /**
   * Provided to be overwritten to filter the errors.
   */
  public filterErrors(
    errorData: IZvFormErrorData[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _includeControls: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _source: 'form' | 'control'
  ): Observable<IZvFormErrorData[]> {
    return of(errorData);
  }
  protected abstract mapDataToError(errorData: IZvFormErrorData[]): Observable<IZvFormError[]>;

  private getErrors(control: AbstractControl, includeControls: boolean, source: 'form' | 'control'): Observable<IZvFormError[]> {
    const update$ = this.createUpdateTrigger(control);

    return update$.pipe(
      map(() => this.getErrorInfo(control, includeControls)),
      switchMap((errorData) => this.filterErrors(errorData, includeControls, source)),
      switchMap((errorData) => this.mapDataToError(errorData))
    );
  }

  private createUpdateTrigger(control: AbstractControl): Observable<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return merge(control.valueChanges, control.statusChanges).pipe(startWith(null), debounceTime(this.options.debounceTime));
  }

  private getErrorInfo(control: AbstractControl, includeControls = false): IZvFormErrorData[] {
    return this.getControlErrorInfoInternal(control, '', includeControls);
  }

  private getControlErrorInfoInternal(control: AbstractControl, controlPath: string, includeControls: boolean): IZvFormErrorData[] {
    const errors: IZvFormErrorData[] = [];

    if (control instanceof FormGroup || control instanceof FormArray) {
      for (const [childName] of Object.entries(control.controls)) {
        const childControl = (control.controls as Record<string, AbstractControl>)[childName];
        if (!(childControl instanceof FormControl) || includeControls) {
          errors.push(
            ...this.getControlErrorInfoInternal(childControl, controlPath ? controlPath + '.' + childName : childName, includeControls)
          );
        }
      }
    }

    if (control.errors) {
      errors.push(...objectToKeyValueArray(control.errors).map((error) => this.createFormErrorData(error, control, controlPath)));
    }

    return errors;
  }

  private createFormErrorData(error: { key: string; value: unknown }, control: AbstractControl, controlPath: string): IZvFormErrorData {
    return {
      controlPath: controlPath,
      errorKey: error.key,
      errorValue: error.value,
      isControl: control instanceof FormControl,
    };
  }
}
