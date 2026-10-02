import { OnDestroy, Injectable } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { AbstractControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { signalErrorControl } from '@zvoove/components/form-base';
import { Subject, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DummyMatFormFieldControl implements MatFormFieldControl<unknown>, OnDestroy {
  public ngField: Field<unknown> | null = null;
  /** Assigned by `ZvFormField`; keeps signal fields on the same error timing as real controls. */
  public errorStateMatcher: ErrorStateMatcher | null = null;
  public parentForm: FormGroupDirective | NgForm | null = null;
  public id = '';
  public userAriaDescribedBy?: string;

  public get required() {
    return this.ngField?.().required() ?? this._required;
  }

  public set required(req) {
    this._required = !!req;
    this.stateChanges.next();
  }

  public get disabled() {
    return this.ngField?.().disabled() ?? this.ngControl?.disabled ?? this._disabled;
  }

  public set disabled(dis) {
    this._disabled = !!dis;
    this.stateChanges.next();
  }

  public get value(): string | null {
    return this._value;
  }

  public set value(value: string | null) {
    this._value = value;
    this.stateChanges.next();
  }

  public get empty() {
    return this.ngField ? !this.ngField().value() : !this.value;
  }

  public get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  public stateChanges = new Subject<void>();
  public placeholder = '';
  public focused = false;
  private _errorState = false;
  get errorState() {
    const field = this.ngField;
    if (!field) return this._errorState;
    // Route through the matcher so emulated controls show errors at the same time as real ones.
    return this.errorStateMatcher
      ? this.errorStateMatcher.isErrorState(signalErrorControl(field), this.parentForm)
      : field().invalid() && field().touched();
  }
  set errorState(value: boolean) {
    this._errorState = value;
  }
  public controlType = 'zv-dummy';

  public autofilled?: boolean;

  private _value: string | null = null;
  private _required = false;
  private _disabled = false;
  private _valueSubscription: Subscription | null = null;
  private _statusSubscription: Subscription | null = null;

  constructor(
    // eslint-disable-next-line @angular-eslint/prefer-inject
    public ngControl: NgControl | null,
    // eslint-disable-next-line @angular-eslint/prefer-inject
    formControl: AbstractControl | null
  ) {
    if (formControl) {
      this._valueSubscription = formControl.valueChanges.pipe(startWith(formControl.value)).subscribe((value) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.value = value;
        this.errorState = formControl.invalid;
      });
      this._statusSubscription = formControl.statusChanges.pipe(startWith(formControl.status)).subscribe(() => {
        this.errorState = formControl.invalid;
      });
    }
  }

  public onContainerClick(): void {
    /* noop - required by MatFormFieldControl */
  }
  public setDescribedByIds(): void {
    /* noop - required by MatFormFieldControl */
  }

  public onChange = () => {};
  public onTouched = () => {};

  public ngOnDestroy() {
    this.stateChanges.complete();
    if (this._statusSubscription) {
      this._statusSubscription.unsubscribe();
    }
    if (this._valueSubscription) {
      this._valueSubscription.unsubscribe();
    }
  }

  public writeValue() {
    /* noop - required by ControlValueAccessor */
  }

  public registerOnChange() {
    /* noop - required by ControlValueAccessor */
  }

  public registerOnTouched(): void {
    /* noop - required by ControlValueAccessor */
  }

  public setDisabledState(): void {
    /* noop - required by ControlValueAccessor */
  }
}
