import { OnDestroy, Injectable } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Injectable()
export class DummyMatFormFieldControl implements MatFormFieldControl<string>, OnDestroy {
  public id = '';
  public userAriaDescribedBy?: string;

  public get required() {
    return this._required;
  }

  public set required(req) {
    this._required = !!req;
    this.stateChanges.next();
  }

  public get disabled() {
    return this._disabled;
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
    return !this.value;
  }

  public get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  public stateChanges = new Subject<void>();
  public placeholder = '';
  public focused = false;
  public errorState = false;
  public controlType = 'zv-dummy';

  public autofilled?: boolean;

  private _value: string | null = null;
  private _required = false;
  private _disabled = false;
  private _valueSubscription: Subscription | null = null;
  private _statusSubscription: Subscription | null = null;

  constructor(
    public ngControl: NgControl | null,
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

  public onContainerClick(): void {}
  public setDescribedByIds(): void {}

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

  public writeValue() {}

  public registerOnChange() {}

  public registerOnTouched(): void {}

  public setDisabledState(): void {}
}
