import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  SimpleChanges,
  forwardRef,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/input';
import { ZV_TIME_FORMATS, ZvTimeAdapter, ZvTimeFormats } from '@zvoove/components/core';
import { Subject, Subscription } from 'rxjs';

/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use MatDatepickerInputEvent instead.
 */
export class ZvTimeInputEvent<TTime> {
  /** The new value for the target datepicker input. */
  value: TTime | null;

  constructor(
    /** Reference to the datepicker input component that emitted the event. */
    public target: ZvTimeInput<TTime>,
    /** Reference to the native input element associated with the datepicker input. */
    public targetElement: HTMLElement
  ) {
    this.value = this.target.value;
  }
}

/** @docs-private */
export const ZV_TIME_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ZvTimeInput),
  multi: true,
};

/** @docs-private */
export const ZV_TIME_VALIDATORS: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => ZvTimeInput),
  multi: true,
};

@Directive({
  selector: 'input[zvTime]',
  standalone: true,
  providers: [ZV_TIME_VALUE_ACCESSOR, ZV_TIME_VALIDATORS, { provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: ZvTimeInput }],
  host: {
    class: 'zv-time-input',
    '[disabled]': 'disabled',
    '(input)': '_onInput($event.target.value)',
    '(change)': '_onChange()',
    '(blur)': '_onBlur()',
  },
  exportAs: 'matTimeInput',
})
export class ZvTimeInput<TTime> implements ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy, Validator {
  /** Whether the component has been initialized. */
  private _isInitialized: boolean;

  /** The value of the input. */
  @Input()
  get value(): TTime | null {
    return this._value;
  }
  set value(value: any) {
    this._assignValueProgrammatically(value);
  }
  protected _value: TTime | null | undefined;

  /** Whether the input is disabled. */
  @Input()
  get disabled(): boolean {
    return !!this._disabled;
  }
  set disabled(value: BooleanInput) {
    const newValue = coerceBooleanProperty(value);
    const element = this._elementRef.nativeElement;

    if (this._disabled !== newValue) {
      this._disabled = newValue;
      this.stateChanges.next(undefined);
    }

    // We need to null check the `blur` method, because it's undefined during SSR.
    // In Ivy static bindings are invoked earlier, before the element is attached to the DOM.
    // This can cause an error to be thrown in some browsers (IE/Edge) which assert that the
    // element has been inserted.
    if (newValue && this._isInitialized && element.blur) {
      // Normally, native input elements automatically blur if they turn disabled. This behavior
      // is problematic, because it would mean that it triggers another change detection cycle,
      // which then causes a changed after checked error if the input element was focused before.
      element.blur();
    }
  }
  private _disabled: boolean;

  /** Emits when a `change` event is fired on this `<input>`. */
  @Output() readonly timeChange: EventEmitter<ZvTimeInputEvent<TTime>> = new EventEmitter<ZvTimeInputEvent<TTime>>();

  /** Emits when an `input` event is fired on this `<input>`. */
  @Output() readonly timeInput: EventEmitter<ZvTimeInputEvent<TTime>> = new EventEmitter<ZvTimeInputEvent<TTime>>();

  /** Emits when the internal state has changed */
  readonly stateChanges = new Subject<void>();

  _onTouched = () => {};
  _validatorOnChange = () => {};

  private _cvaOnChange: (value: any) => void = () => {};
  private _localeSubscription = Subscription.EMPTY;

  /** The form control validator for whether the input parses. */
  private _parseValidator: ValidatorFn = (): ValidationErrors | null => {
    return this._lastValueValid ? null : { zvTimeInputParse: { text: this._elementRef.nativeElement.value } };
  };

  /** Gets the base validator functions. */
  protected _getValidators(): ValidatorFn[] {
    return [this._parseValidator];
  }

  /** Combined form control validator for this input. */
  protected _validator: ValidatorFn | null;

  /** Whether the last value set on the input was valid. */
  protected _lastValueValid = false;

  constructor(
    private _elementRef: ElementRef<HTMLInputElement>,
    @Optional() private _timeAdapter: ZvTimeAdapter<TTime>,
    @Optional() @Inject(ZV_TIME_FORMATS) private _timeFormats: ZvTimeFormats
  ) {
    this._validator = Validators.compose(this._getValidators());
  }

  ngAfterViewInit() {
    this._isInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (timeInputsHaveChanged(changes, this._timeAdapter)) {
      this.stateChanges.next();
    }
  }

  ngOnDestroy() {
    this._localeSubscription.unsubscribe();
    this.stateChanges.complete();
  }

  /** @docs-private */
  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn;
  }

  /** @docs-private */
  validate(c: AbstractControl): ValidationErrors | null {
    return this._validator ? this._validator(c) : null;
  }

  // Implemented as part of ControlValueAccessor.
  writeValue(value: TTime): void {
    this._assignValueProgrammatically(value);
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => void): void {
    this._cvaOnChange = fn;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _onInput(value: string) {
    const lastValueWasValid = this._lastValueValid;
    let time = this._timeAdapter.parse(value, this._timeFormats.parse.timeInput);
    this._lastValueValid = this._isValidValue(time);
    time = this._timeAdapter.getValidTimeOrNull(time);
    const hasChanged = !this._timeAdapter.sameTime(time, this.value);

    // We need to fire the CVA change event for all
    // nulls, otherwise the validators won't run.
    if (!time || hasChanged) {
      this._cvaOnChange(time);
    } else {
      // Call the CVA change handler for invalid values
      // since this is what marks the control as dirty.
      if (value && !this.value) {
        this._cvaOnChange(time);
      }

      if (lastValueWasValid !== this._lastValueValid) {
        this._validatorOnChange();
      }
    }

    if (hasChanged) {
      this._assignValue(time);
      this.timeInput.emit(new ZvTimeInputEvent(this, this._elementRef.nativeElement));
    }
  }

  _onChange() {
    this.timeChange.emit(new ZvTimeInputEvent(this, this._elementRef.nativeElement));
  }

  /** Handles blur events on the input. */
  _onBlur() {
    // Reformat the input only if we have a valid value.
    if (this.value) {
      this._formatValue(this.value);
    }

    this._onTouched();
  }

  /** Formats a value and sets it on the input element. */
  protected _formatValue(value: TTime | null) {
    this._elementRef.nativeElement.value = value != null ? this._timeAdapter.format(value, this._timeFormats.display.timeInput) : '';
  }

  /** Assigns a value to the model. */
  private _assignValue(value: TTime | null) {
    this._value = value;
  }

  /** Programmatically assigns a value to the input. */
  protected _assignValueProgrammatically(value: TTime | null) {
    value = this._timeAdapter.deserialize(value);
    this._lastValueValid = this._isValidValue(value);
    value = this._timeAdapter.getValidTimeOrNull(value);
    this._assignValue(value);
    this._formatValue(value);
  }

  /** Whether a value is considered valid. */
  private _isValidValue(value: TTime | null): boolean {
    return !value || !!this._timeAdapter.isValid(value);
  }
}

/**
 * Checks whether the `SimpleChanges` object from an `ngOnChanges`
 * callback has any changes, accounting for date objects.
 */
export function timeInputsHaveChanged(changes: SimpleChanges, adapter: ZvTimeAdapter<unknown>): boolean {
  const keys = Object.keys(changes);

  for (const key of keys) {
    const { previousValue, currentValue } = changes[key];

    if (adapter.isTimeInstance(previousValue) && adapter.isTimeInstance(currentValue)) {
      if (!adapter.sameTime(previousValue, currentValue)) {
        return true;
      }
    } else {
      return true;
    }
  }

  return false;
}
