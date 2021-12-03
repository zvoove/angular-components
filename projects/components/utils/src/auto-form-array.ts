import { AbstractControl, AbstractControlOptions, AsyncValidatorFn, FormArray, ValidatorFn } from '@angular/forms';

export class AutoFormArray extends FormArray {
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
    private controlGenerator: () => AbstractControl,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super([], validatorOrOpts, asyncValidator);
  }

  public override patchValue(
    value: unknown[],
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ): void {
    this.resizeTo(value ? value.length : 0);
    return super.patchValue(value, options);
  }

  public override reset(
    value?: { length: number },
    options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    }
  ): void {
    this.resizeTo(value ? value.length : 0);
    return super.reset(value, options);
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
