import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export function hasRequiredField(abstractControl: AbstractControl): boolean {
  if (abstractControl.validator) {
    const validator = abstractControl.validator({} as AbstractControl);
    if (validator && validator.required) {
      return true;
    }
  }
  if (abstractControl instanceof FormGroup || abstractControl instanceof FormArray) {
    const controls: any = abstractControl.controls; // any because of https://github.com/microsoft/TypeScript/issues/32552
    for (const controlName in controls) {
      if (controls[controlName]) {
        if (hasRequiredField(controls[controlName])) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Returns the type of the control. Most of the time the type is the same as the selector.
 *
 * @param control The control class (MatSlider, MatSelect, ...)
 */
export function getControlType(control: any): string | null {
  const controlId: string = control.id /* MatFormFieldControl, z.B. checkbox */ || control.name; /* mat-radio-group */
  if (controlId) {
    const parts = controlId.split('-');
    if (parts[parts.length - 1].match(/[0-9]/)) {
      parts.pop();
    }
    return parts.join('-');
  }

  if (control.step !== undefined && control.thumbLabel !== undefined) {
    return 'mat-slider';
  }

  return null;
}
