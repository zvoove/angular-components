import { OnDestroy, Injectable } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Injectable()
export class DummyMatFormFieldControl extends MatFormFieldControl<string> implements OnDestroy {
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
  public placeholder: string;
  public focused = false;
  public errorState = false;
  public controlType = 'ps-dummy';

  public autofilled?: boolean;

  private _value: string | null = null;
  private _required = false;
  private _disabled = false;
  private _valueSubscription: Subscription;
  private _statusSubscription: Subscription;

  constructor(public ngControl: NgControl, formControl: AbstractControl) {
    super();

    if (formControl) {
      this._valueSubscription = formControl.valueChanges.pipe(startWith(formControl.value)).subscribe(value => {
        this.value = value;
        this.errorState = formControl.invalid;
      });
      this._statusSubscription = formControl.statusChanges.pipe(startWith(formControl.status)).subscribe(() => {
        this.errorState = formControl.invalid;
      });
    }
  }

  public onContainerClick(_: MouseEvent): void {}
  public setDescribedByIds(_: string[]): void {}

  public onChange = (_: any) => {};
  public onTouched = (_: any) => {};

  public ngOnDestroy() {
    this.stateChanges.complete();
    if (this._statusSubscription) {
      this._statusSubscription.unsubscribe();
    }
    if (this._valueSubscription) {
      this._valueSubscription.unsubscribe();
    }
  }

  public writeValue(_: any) {}

  public registerOnChange(_: () => void) {}

  public registerOnTouched(_: any): void {}

  public setDisabledState(_: boolean): void {}
}
