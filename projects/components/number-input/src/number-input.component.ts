/* eslint-disable @angular-eslint/no-input-rename -- Backing models retain existing public binding names via compatibility setters. */
/* eslint-disable @angular-eslint/prefer-signals -- value setter preserves legacy output semantics; id remains a Material string. */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  Input,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  output,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, Validators } from '@angular/forms';
import { FORM_FIELD, FormValueControl, Field } from '@angular/forms/signals';
import { connectLegacyControl, signalErrorControl } from '@zvoove/components/form-base';
import { _ErrorStateTracker, ErrorStateMatcher } from '@angular/material/core';
import { MAT_FORM_FIELD, MatFormFieldControl } from '@angular/material/form-field';
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
    '[attr.disabled]': 'isDisabled()',
    '[attr.required]': 'isRequired',
    '[attr.readonly]': 'readonly() || null',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-required]': 'isRequired.toString()',
  },
  providers: [{ provide: MatFormFieldControl, useExisting: ZvNumberInput }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatIcon],
})
export class ZvNumberInput implements FormValueControl<number | null>, MatFormFieldControl<number | null>, OnDestroy, OnInit, DoCheck {
  readonly labelledById = signal<string | null>(null);
  setLabelledById(id: string | null) {
    this.labelledById.set(id);
  }

  public readonly ngControl = inject(FORM_FIELD, { optional: true, self: true }) ? null : inject(NgControl, { optional: true, self: true });
  private readonly defaultMatcher = inject(ErrorStateMatcher);
  private readonly parentForm = inject(FormGroupDirective, { optional: true }) ?? inject(NgForm, { optional: true });
  protected readonly parentMatField = inject(MAT_FORM_FIELD, { optional: true });
  private readonly localeId = inject(LOCALE_ID);

  /** Mininum boundary value. */
  public readonly min = input<number | undefined, unknown>(undefined, {
    transform: (value) => (value == null ? undefined : (value as number)),
  });

  /** Maximum boundary value. */
  public readonly max = input<number | undefined, unknown>(undefined, {
    transform: (value) => (value == null ? undefined : (value as number)),
  });

  /** Index of the element in tabbing order. */
  public readonly tabindex = input<number | null>(null);

  /** Number of allowed decimal places. */
  public readonly decimals = input<number | null>(null);

  /** Step factor to increment/decrement the value. */
  public readonly stepSize = input(1);

  public readonly _calculatedDecimals = computed(() => {
    const val = this.stepSize();
    if (val != null) {
      const tokens = val.toString().split(/[,]|[.]/);
      return tokens[1] ? tokens[1].length : null;
    }
    return null;
  });

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
  readonly disabled = model(false, { alias: 'disabledState' });
  @Input('disabled')
  set disabledInput(value: boolean) {
    this.disabled.set(value != null && String(value) !== 'false');
  }
  readonly isDisabled = this.disabled;
  readonly touch = output<void>();
  private readonly formField = inject(FORM_FIELD, { optional: true, self: true });
  get ngField(): Field<number | null> | null {
    return (this.formField?.field() as Field<number | null>) ?? null;
  }

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
  readonly required = model(false, { alias: 'requiredState' });
  private explicitRequired = false;
  @Input('required')
  set requiredInput(value: boolean) {
    this.explicitRequired = true;
    this.required.set(coerceBooleanProperty(value));
  }

  get isRequired() {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- Validator identity is required by hasValidator.
    return this.required() || !!this.ngControl?.control?.hasValidator(Validators.required);
  }

  /** An object used to control when error messages are shown. */
  @Input()
  get errorStateMatcher() {
    return this._errorStateTracker.matcher;
  }
  set errorStateMatcher(value: ErrorStateMatcher) {
    this._errorStateTracker.matcher = value;
    this.stateChanges.next();
  }

  /** Whether the input is in an error state. */
  get errorState() {
    const field = this.ngField;
    return field
      ? (this.errorStateMatcher ?? this.defaultMatcher).isErrorState(signalErrorControl(field), this.parentForm)
      : this._errorStateTracker.errorState;
  }
  set errorState(value: boolean) {
    this._errorStateTracker.errorState = value;
  }

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  // Keep the historical valueChange output, including repeated user edits.
  // The model's separate alias avoids a duplicate generated valueChange output.
  readonly value = model<number | null>(null, { alias: 'modelValue' });
  @Input('value')
  set valueInput(value: number | null) {
    if (Object.is(value, this.value())) return;
    this.value.set(value);
    this._formatValue();
    this.stateChanges.next();
  }
  readonly valueChange = output<number | null>();

  /** Whether the element is readonly. */
  readonly readonly = input(false, { transform: coerceBooleanProperty });

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  get empty(): boolean {
    return (this.value() === null || this.value() === undefined) && !this.autofilled;
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
  _timer: ReturnType<typeof setTimeout> | null = null;
  _decimalSeparator!: string;
  _thousandSeparator!: string;
  _errorStateTracker: _ErrorStateTracker;

  public readonly _inputfieldViewChild = viewChild<ElementRef<HTMLInputElement>>('inputfield');

  constructor() {
    const ngControl = this.ngControl;
    const _parentForm = inject(NgForm, { optional: true });
    const _parentFormGroup = inject(FormGroupDirective, { optional: true });
    const _defaultErrorStateMatcher = inject(ErrorStateMatcher);

    connectLegacyControl(
      this.ngControl,
      this.valueChange,
      this.touch,
      (value) => {
        this.valueInput = value;
      },
      (disabled) => this.disabled.set(disabled)
    );

    this._errorStateTracker = new _ErrorStateTracker(
      _defaultErrorStateMatcher,
      ngControl,
      _parentFormGroup,
      _parentForm,
      this.stateChanges
    );

    effect(() => {
      const el = this._inputfieldViewChild();
      if (el) {
        untracked(() => this._formatValue());
      }
    });
  }

  ngOnInit() {
    // Force setter to be called in case id was not specified.
    // eslint-disable-next-line no-self-assign
    this.id = this.id;

    const intlParts = Intl.NumberFormat(this.localeId).formatToParts(1000.1);
    this._decimalSeparator = intlParts.find((part) => part.type === 'decimal')!.value;
    this._thousandSeparator = intlParts.find((part) => part.type === 'group')!.value;
  }

  ngOnDestroy() {
    this._clearTimer();
    this.stateChanges.complete();
  }

  ngDoCheck() {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- Validator identity is required by hasValidator.
    if (this.ngControl?.control && !this.explicitRequired) this.required.set(this.ngControl.control.hasValidator(Validators.required));
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
    this._inputfieldViewChild()?.nativeElement.focus(options);
  }

  reset() {
    this._formatValue();
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
      clearTimeout(this._timer);
    }
  }

  _spin(_event: Event, dir: number) {
    if (this.isDisabled() || this.readonly()) return;
    const step = this.stepSize() * dir;
    const newValue = this._fixNumber((this.value() ?? 0) + step);
    this.value.set(newValue);
    this._formatValue();
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
    const value = this.value();
    if (value == null) {
      this._formattedValue = '';
    } else {
      const decimals = this._getDecimals();
      this._formattedValue = value.toLocaleString(this.localeId, { maximumFractionDigits: decimals ?? undefined });
    }

    const viewChild = this._inputfieldViewChild();
    if (viewChild?.nativeElement) {
      viewChild.nativeElement.value = this._formattedValue;
    }
  }

  _getDecimals() {
    return this.decimals() === null ? this._calculatedDecimals() : this.decimals();
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

    const max = this.max();
    if (max != null && value > max) {
      value = max;
    }

    const min = this.min();
    if (min != null && value < min) {
      value = min;
    }

    return value;
  }

  _onUpButtonMousedown(event: Event) {
    if (!this.isDisabled()) {
      this._inputfieldViewChild()?.nativeElement.focus();
      this._repeat(event, null, 1);
      event.preventDefault();
    }
  }

  _onUpButtonMouseup(_event: Event) {
    if (!this.isDisabled()) {
      this._clearTimer();
    }
  }

  _onUpButtonMouseleave(_event: Event) {
    if (!this.isDisabled()) {
      this._clearTimer();
    }
  }

  _onDownButtonMousedown(event: Event) {
    if (!this.isDisabled()) {
      this._inputfieldViewChild()?.nativeElement.focus();
      this._repeat(event, null, -1);
      event.preventDefault();
    }
  }

  _onDownButtonMouseup(_event: Event) {
    if (!this.isDisabled()) {
      this._clearTimer();
    }
  }

  _onDownButtonMouseleave(_event: Event) {
    if (!this.isDisabled()) {
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
    this.value.set(this._parseValue((event.target as HTMLInputElement).value));
    this.stateChanges.next();
    this.valueChange.emit(this.value());
  }

  /** Callback for the cases where the focused state of the input changes. */
  _onFocusChanged(isFocused: boolean) {
    if (isFocused !== this.focused && (!this.readonly() || !isFocused)) {
      this.focused = isFocused;
      this.stateChanges.next();
    }
    if (!isFocused) {
      this._formatValue();
      this.touch.emit();
    }
  }
}
