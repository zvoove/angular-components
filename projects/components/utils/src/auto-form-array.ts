/* eslint-disable @typescript-eslint/naming-convention */
import { AbstractControl, AbstractControlOptions, AsyncValidatorFn, FormArray, ValidatorFn } from '@angular/forms';

export class AutoFormArray<TControl extends AbstractControl<any> = any> extends FormArray<TControl> {
  /**
   * Creates a new `FormArray` instance.
   *
   * @param controlGenerator A function that generates the control for en entry.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains validation functions
   * and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator functions
   *
   */
  constructor(
    private controlGenerator: () => TControl,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super([], validatorOrOpts, asyncValidator);
  }

  public override patchValue(...args: Parameters<FormArray<TControl>['patchValue']>) {
    this.resizeTo(args[0] ? args[0].length : 0);
    return super.patchValue(...args);
  }

  public override reset(...args: Parameters<FormArray<TControl>['reset']>) {
    this.resizeTo(args[0] ? args[0].length : 0);
    return super.reset(...args);
  }

  public resizeTo(length: number) {
    while (this.length < length) {
      const newForm = this.controlGenerator();
      if (this.disabled) {
        newForm.disable();
      }
      this.push(newForm);
    }
    while (this.length > length) {
      this.removeAt(this.length - 1);
    }
  }
}
