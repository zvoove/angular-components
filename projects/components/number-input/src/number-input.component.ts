/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { _ErrorStateTracker, ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { replaceAll } from '@zvoove/components/utils';
import { Subject } from 'rxjs';
import { MatIcon } from '@angular/material/icon';

let nextUniqueId = 0;

/** Directive that allows a native input to work inside a `MatFormField`. */
@Component({
  selector: 'zv-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss'],
  host: {
    // Native input properties that are overwritten by Angular inputs need to be synced with
    // the native input element. Otherwise property bindings for those don't work.
    '[attr.id]': 'id',
    '[attr.placeholder]': 'placeholder',
    '[attr.disabled]': 'disabled',
    '[attr.required]': 'required',
    '[attr.readonly]': 'readonly || null',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-required]': 'required.toString()',
  },
  providers: [{ provide: MatFormFieldControl, useExisting: ZvNumberInput }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatIcon],
})
export class ZvNumberInput implements ControlValueAccessor, MatFormFieldControl<number>, OnChanges, OnDestroy, OnInit, DoCheck {
  /** Mininum boundary value. */
  @Input() min: number | null = null;

  /** Maximum boundary value. */
  @Input() max: number | null = null;

  /** Index of the element in tabbing order. */
  @Input() tabindex: number | null = null;

  /** Number of allowed decimal places. */
  @Input() decimals: number | null = null;

  /** Step factor to increment/decrement the value. */
  @Input()
  get stepSize(): number {
    return this._stepSize;
  }
  set stepSize(val: number) {
    this._stepSize = val;

    if (this._stepSize != null) {
      const tokens = this.stepSize.toString().split(/[,]|[.]/);
      this._calculatedDecimals = tokens[1] ? tokens[1].length : null;
    }
  }
  _stepSize = 1;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  focused = false;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  readonly stateChanges: Subject<void> = new Subject<void>();

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  controlType = 'zv-number-input';

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  autofilled = false;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input()
  get disabled(): boolean {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled;
    }
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
    this.cd.markForCheck();
  }
  protected _disabled = false;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input()
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value || this._uid;
  }
  protected _id = '';

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input() placeholder = '';

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.cd.markForCheck();
  }
  protected _required = false;

  /** An object used to control when error messages are shown. */
  @Input()
  get errorStateMatcher() {
    return this._errorStateTracker.matcher;
  }
  set errorStateMatcher(value: ErrorStateMatcher) {
    this._errorStateTracker.matcher = value;
  }

  /** Whether the input is in an error state. */
  get errorState() {
    return this._errorStateTracker.errorState;
  }
  set errorState(value: boolean) {
    this._errorStateTracker.errorState = value;
  }

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input()
  get value(): number | null {
    return this._value;
  }
  set value(value: number | null) {
    if (value !== this.value) {
      this._value = value;
      this._formatValue();
      this.stateChanges.next();
    }
  }
  _value: number | null = null;

  @Output() public readonly valueChange = new EventEmitter<number | null>();

  /** Whether the element is readonly. */
  @Input()
  get readonly(): boolean {
    return this._readonly;
  }
  set readonly(value: boolean) {
    this._readonly = coerceBooleanProperty(value);
    this.cd.markForCheck();
  }
  private _readonly = false;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  get empty(): boolean {
    return (this._value === null || this._value === undefined) && !this.autofilled;
  }

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  protected _uid = `zv-number-input-${nextUniqueId++}`;
  /** The aria-describedby attribute on the input for improved a11y. */
  _ariaDescribedby = '';

  _formattedValue = '';
  _timer: any;
  _decimalSeparator!: string;
  _thousandSeparator!: string;
  _calculatedDecimals: number | null = null;
  _errorStateTracker: _ErrorStateTracker;

  @ViewChild('inputfield', { static: true })
  _inputfieldViewChild!: ElementRef<HTMLInputElement>;

  _onModelChange = (_val: any) => {};
  _onModelTouched = () => {};

  constructor(
    /** @docs-private */
    @Optional() @Self() public ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    private cd: ChangeDetectorRef,
    @Inject(LOCALE_ID) private localeId: string
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this._errorStateTracker = new _ErrorStateTracker(
      _defaultErrorStateMatcher,
      ngControl,
      _parentFormGroup,
      _parentForm,
      this.stateChanges
    );
  }

  ngOnInit() {
    // Force setter to be called in case id was not specified.
    // eslint-disable-next-line no-self-assign
    this.id = this.id;

    const intlParts = Intl.NumberFormat(this.localeId).formatToParts(1000.1);
    this._decimalSeparator = intlParts.find((part) => part.type === 'decimal')!.value;
    this._thousandSeparator = intlParts.find((part) => part.type === 'group')!.value;
  }

  ngOnChanges() {
    this.stateChanges.next();
  }

  ngOnDestroy() {
    this._clearTimer();
    this.stateChanges.complete();
  }

  ngDoCheck() {
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();
    }
  }

  /** Refreshes the error state of the input. */
  updateErrorState() {
    this._errorStateTracker.updateErrorState();
  }

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  setDescribedByIds(ids: string[]) {
    this._ariaDescribedby = ids.join(' ');
  }

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  onContainerClick() {
    if (!this.focused) {
      this.focus();
    }
  }

  /** Focuses the input. */
  focus(options?: FocusOptions): void {
    this._inputfieldViewChild.nativeElement.focus(options);
  }

  writeValue(value: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.value = value;
  }

  registerOnChange(fn: (val: any) => void): void {
    this._onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onModelTouched = fn;
  }

  setDisabledState(val: boolean): void {
    this.disabled = val;
  }

  _repeat(event: Event, interval: number | null, dir: number) {
    const i = interval || 500;

    this._clearTimer();
    this._timer = setTimeout(() => {
      this._repeat(event, 40, dir);
    }, i);

    this._spin(event, dir);
  }

  _clearTimer() {
    if (this._timer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      clearInterval(this._timer);
    }
  }

  _spin(_event: Event, dir: number) {
    const step = this.stepSize * dir;
    const newValue = this._fixNumber((this.value ?? 0) + step);
    this.value = newValue;
    this._onModelChange(newValue);
    this.valueChange.emit(newValue);
  }

  _parseValue(val: string): number | null {
    val = val.trim();
    if (val === '') {
      return null;
    }

    val = replaceAll(val, this._thousandSeparator, '');
    val = replaceAll(val, this._decimalSeparator, '.');

    const value = this._fixNumber(parseFloat(val));
    return value;
  }

  _formatValue() {
    const value: any = this.value;
    if (value == null) {
      this._formattedValue = '';
    } else {
      const decimals = this._getDecimals();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this._formattedValue = value.toLocaleString(this.localeId, { maximumFractionDigits: decimals });
    }

    if (this._inputfieldViewChild && this._inputfieldViewChild.nativeElement) {
      this._inputfieldViewChild.nativeElement.value = this._formattedValue;
    }
  }

  _getDecimals() {
    return this.decimals === null ? this._calculatedDecimals : this.decimals;
  }

  _toFixed(value: number, decimals: number) {
    const power = Math.pow(10, decimals || 0);
    return String(Math.round(value * power) / power);
  }

  _fixNumber(value: number) {
    const decimals = this._getDecimals();
    if (decimals) {
      value = parseFloat(this._toFixed(value, decimals));
    } else {
      value = value >= 0 ? Math.floor(value) : Math.ceil(value);
    }

    if (isNaN(value)) {
      return null;
    }

    if (this.max !== null && value > this.max) {
      value = this.max;
    }

    if (this.min !== null && value < this.min) {
      value = this.min;
    }

    return value;
  }

  _onUpButtonMousedown(event: Event) {
    if (!this.disabled) {
      this._inputfieldViewChild.nativeElement.focus();
      this._repeat(event, null, 1);
      event.preventDefault();
    }
  }

  _onUpButtonMouseup(_event: Event) {
    if (!this.disabled) {
      this._clearTimer();
    }
  }

  _onUpButtonMouseleave(_event: Event) {
    if (!this.disabled) {
      this._clearTimer();
    }
  }

  _onDownButtonMousedown(event: Event) {
    if (!this.disabled) {
      this._inputfieldViewChild.nativeElement.focus();
      this._repeat(event, null, -1);
      event.preventDefault();
    }
  }

  _onDownButtonMouseup(_event: Event) {
    if (!this.disabled) {
      this._clearTimer();
    }
  }

  _onDownButtonMouseleave(_event: Event) {
    if (!this.disabled) {
      this._clearTimer();
    }
  }

  _onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this._spin(event, 1);
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      this._spin(event, -1);
      event.preventDefault();
    }
  }

  _onInput(event: Event) {
    this._value = this._parseValue((event.target as HTMLInputElement).value);
    this.stateChanges.next();
    this._onModelChange(this.value);
    this.valueChange.emit(this.value);
  }

  /** Callback for the cases where the focused state of the input changes. */
  _onFocusChanged(isFocused: boolean) {
    if (isFocused !== this.focused && (!this.readonly || !isFocused)) {
      this.focused = isFocused;
      this.stateChanges.next();
    }
    if (!isFocused) {
      this._formatValue();
      this._onModelTouched();
    }
  }
}
