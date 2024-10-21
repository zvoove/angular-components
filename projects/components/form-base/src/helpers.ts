import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export function hasRequiredField(abstractControl: AbstractControl): boolean {
  if (abstractControl.validator) {
    const validator = abstractControl.validator({} as AbstractControl);
    if (validator && validator.required) {
      return true;
    }
  }
  if (abstractControl instanceof FormGroup || abstractControl instanceof FormArray) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls: any = abstractControl.controls; // any because of https://github.com/microsoft/TypeScript/issues/32552
    for (const controlName in controls) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (controls[controlName]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const controlId: string = control.id /* MatFormFieldControl, z.B. checkbox */ || control.name; /* mat-radio-group */
  if (controlId) {
    const parts = controlId.split('-');
    if (parts[parts.length - 1].match(/[0-9]/)) {
      parts.pop();
    }
    return parts.join('-');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (control._slider !== undefined || (control._knobRadius !== undefined && control._step !== undefined)) {
    return 'mat-slider';
  }

  return null;
}
