/* eslint-disable @angular-eslint/no-input-rename -- Backing models retain existing public binding names via compatibility setters. */
/* eslint-disable @angular-eslint/prefer-signals -- Compatibility setters preserve public value events and Material id */
import { coerceBooleanProperty } from '@angular/cdk/coercion';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  Input,
  OnInit,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  output,
  viewChild,
  model,
  signal,
  effect,
  untracked,
  OnDestroy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgControl,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { FORM_FIELD, FormValueControl, Field, transformedValue } from '@angular/forms/signals';
import { LegacyChangeNotifier, connectLegacyControl, createRequiredDetector, signalErrorControlSnapshot } from '@zvoove/components/form-base';
import { ErrorStateMatcher, _ErrorStateTracker } from '@angular/material/core';
import { MatDatepickerControl, MatDatepickerInput, MatDatepickerModule, MatDatepickerPanel } from '@angular/material/datepicker';
import { MAT_FORM_FIELD, MatFormFieldControl } from '@angular/material/form-field';
import { ZvDateTimeAdapter } from '@zvoove/components/core';
import { Subject } from 'rxjs';
import { ZvTimeInput } from './time-input.directive';

let nextUniqueId = 0;

@Component({
  selector: 'zv-date-time-input',
  templateUrl: './date-time-input.component.html',
  styleUrls: ['./date-time-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatDatepickerModule, ZvTimeInput, ReactiveFormsModule],
  host: {
    '[attr.id]': 'id',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-required]': 'required().toString()',
    '[attr.aria-disabled]': 'isDisabled().toString()',
    '[attr.aria-invalid]': 'errorState',
  },
  providers: [{ provide: MatFormFieldControl, useExisting: ZvDateTimeInput }],
})
export class ZvDateTimeInput<TDateTime, TDate, TTime>
  implements FormValueControl<TDateTime | null>, MatFormFieldControl<TDateTime | null>, OnInit, DoCheck, OnDestroy
{
  readonly labelledById = signal<string | null>(null);
  setLabelledById(id: string | null) {
    this.labelledById.set(id);
  }

  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  public _changeDetectorRef = inject(ChangeDetectorRef);
  _defaultErrorStateMatcher = inject(ErrorStateMatcher);
  _parentForm = inject(NgForm, { optional: true });
  _parentFormGroup = inject(FormGroupDirective, { optional: true });
  _parentFormField = inject(MAT_FORM_FIELD, { optional: true });
  private readonly formField = inject(FORM_FIELD, { optional: true, self: true });
  ngControl = this.formField ? null : inject(NgControl, { optional: true, self: true });
  private dateTimeAdapter = inject(ZvDateTimeAdapter<TDateTime, TDate, TTime>);

  /**
   * An optional name for the control type that can be used to distinguish `mat-form-field` elements
   * based on their control type. The form field will add a class,
   * `mat-form-field-type-{{controlType}}` to its root element.
   */
  readonly controlType = 'zv-date-time-input';

  /** The aria-describedby attribute on the input for improved a11y. */
  _ariaDescribedby!: string;

  /** Unique id for this input. */
  private _uid = `${this.controlType}-${nextUniqueId++}`;

  /** Unique id of the element. */
  @Input()
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value || this._uid;
    this.stateChanges.next();
  }
  private _id = this._uid;

  public readonly matDatepicker = input.required<MatDatepickerPanel<MatDatepickerControl<unknown>, unknown, unknown>>();

  /** Value of the date-time control. */
  readonly value = model<TDateTime | null>(null, { alias: 'modelValue' });
  @Input('value')
  set valueInput(value: TDateTime | null) {
    this._assignValue(value, { assignForm: true, emitChange: !this.formField });
  }
  readonly valueChange = output<TDateTime | null>();
  readonly touch = output<void>();
  get ngField(): Field<TDateTime | null> | null {
    return (this.formField?.field() as Field<TDateTime | null>) ?? null;
  }
  /** Placeholder to be shown if no value has been selected. (not supported for this component!) */
  public readonly placeholder = '';

  /** Whether the input is focused. */
  get focused(): boolean {
    return this._focused;
  }
  private _focused = false;

  readonly disabled = model(false, { alias: 'disabledState' });
  @Input('disabled')
  set disabledInput(value: boolean) {
    this.disabled.set(value != null && String(value) !== 'false');
  }
  readonly isDisabled = this.disabled;
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  readonly stateChanges: Subject<void> = new Subject<void>();

  /** Whether the control is empty. */
  get empty(): boolean {
    const dateRef = this._dateInputElementRef();
    const timeRef = this._timeInputElementRef();
    if (!dateRef || !timeRef) {
      return this.value() == null;
    }
    return !dateRef.nativeElement.value && !timeRef.nativeElement.value;
  }

  /** Whether the `MatFormField` label should try to float. */
  get shouldLabelFloat(): boolean {
    return !this.empty || this._focused;
  }

  /** Whether the component is required. */
  readonly required = model(false, { alias: 'requiredState' });
  private explicitRequired = false;
  @Input('required')
  set requiredInput(value: boolean | null | undefined) {
    // A binding that resolves to null/undefined is treated like no binding at all, so
    // detection from the bound form control still applies.
    this.explicitRequired = value != null;
    if (value != null) this.required.set(coerceBooleanProperty(value));
  }

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
    const snapshot = this._signalErrorSnapshot();
    return snapshot
      ? (this.errorStateMatcher ?? this._defaultErrorStateMatcher).isErrorState(snapshot, this._parentFormGroup ?? this._parentForm)
      : this._errorStateTracker.errorState;
  }
  set errorState(value: boolean) {
    this._errorStateTracker.errorState = value;
  }

  datePlaceholder = this.dateTimeAdapter.dateAdapter.parseFormatExample();
  timePlaceholder = this.dateTimeAdapter.timeAdapter.parseFormatExample();

  /** `Callback called when validators have been changed` */
  _validatorOnChange = () => {};

  _form = new FormGroup({
    date: new FormControl<TDate | null>(null),
    time: new FormControl<TTime | null>(null),
  });

  public readonly _dateInputElementRef = viewChild<ElementRef<HTMLInputElement>>('date');
  public readonly _timeInputElementRef = viewChild<ElementRef<HTMLInputElement>>('time');
  public readonly matDateInput = viewChild(MatDatepickerInput);
  public readonly zvTimeInput = viewChild(ZvTimeInput);
  _errorStateTracker: _ErrorStateTracker;

  private readonly raw = transformedValue(this.value, {
    parse: (raw: { value: TDateTime | null; errors: ValidationErrors | null }) => ({
      value: raw.value,
      error: raw.errors ? Object.entries(raw.errors).map(([kind, context]) => ({ kind: kind, context: context as unknown })) : undefined,
    }),
    format: (value) => ({ value: value, errors: null as ValidationErrors | null }),
  });
  private readonly parentValidator = (control: AbstractControl) => this.validate(control);
  private previousEmitted: TDateTime | null = null;
  private readonly _signalErrorSnapshot = signalErrorControlSnapshot(() => this.ngField);
  private readonly _detectRequired = createRequiredDetector(this.ngControl);
  private readonly _notifyLegacyChange: LegacyChangeNotifier<TDateTime | null>;

  constructor() {
    this._notifyLegacyChange = connectLegacyControl(
      this.ngControl,
      this.touch,
      (value) => {
        this._assignValue(value, { assignForm: true, emitChange: false });
        this.reset();
      },
      (disabled) => this.disabled.set(disabled)
    );
    effect(() => {
      const disabled = this.isDisabled();
      untracked(() => {
        if (disabled) this._form.disable({ emitEvent: false });
        else this._form.enable({ emitEvent: false });
        this.stateChanges.next();
      });
    });

    this._errorStateTracker = new _ErrorStateTracker(
      this._defaultErrorStateMatcher,
      this.ngControl,
      this._parentFormGroup,
      this._parentForm,
      this.stateChanges
    );

    this._form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const newValue = this.dateTimeAdapter.mergeDateTime(value.date, value.time);

      const errors = this.validate(this._form);
      this.raw.set({ value: newValue as TDateTime | null, errors: errors });
      this._assignValue(newValue as TDateTime | null, { assignForm: false, emitChange: true });

      // We need to markForCheck here, otherwise angular wouldn't recheck
      // shouldLabelFloat when selecting the date in the picker
      this._changeDetectorRef.markForCheck();
      // We need to emit stateChanges here, to make the form-field aware of the
      // shouldLabelFloat change when selecting the date in the picker and using [(value)] binding
      this.stateChanges.next();
    });
  }

  ngOnInit(): void {
    if (this.ngControl) {
      // Note: we provide the validator through here, instead of
      // the `providers` NG_VALIDATORS to avoid running into a circular import.
      this.ngControl.control!.addValidators(this.parentValidator);
      this.ngControl.control!.updateValueAndValidity();
    }
  }

  ngDoCheck() {
    if (!this.explicitRequired) {
      const detected = this._detectRequired();
      if (detected !== null) this.required.set(detected);
    }
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
   * @docs-private
   */
  setDescribedByIds(ids: string[]) {
    this._ariaDescribedby = ids.join(' ');
  }

  _childValidators: ValidatorFn[] = [
    (control) => (this._dateInputElementRef()?.nativeElement.value ? this.matDateInput()?.validate(control) : null) ?? null,
    (control) => (this._timeInputElementRef()?.nativeElement.value ? this.zvTimeInput()?.validate(control) : null) ?? null,
  ];
  validate(control: AbstractControl): ValidationErrors | null {
    const errors = this._childValidators.map((v) => v(control)).filter((error) => error);
    if (!errors.length) {
      if (this._form.value.time && !this._form.value.date) {
        return { zvDateTimeInputState: this._form.value };
      }
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Object.assign({}, ...errors);
  }

  /** @docs-private */
  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn;
  }

  reset() {
    this._form.setValue(this.dateTimeAdapter.splitDateTime(this.value()), { emitEvent: false });
    const dateInput = this.matDateInput();
    if (dateInput) dateInput.value = this._form.controls.date.value;
    this.zvTimeInput()?.reset();
    this.raw.set({ value: this.value(), errors: null });
    this.stateChanges.next();
  }
  ngOnDestroy() {
    this.ngControl?.control?.removeValidators(this.parentValidator);
    this.stateChanges.complete();
  }

  /** Handles a click on the control's container. */
  public onContainerClick(event: MouseEvent): void {
    this._focus(event);
  }

  /** Focuses the date input element. */
  focus(options?: FocusOptions): void {
    this._focus(null, options);
  }

  /** Focuses the date input element. */
  private _focus(event: MouseEvent | null, options?: FocusOptions): void {
    let target: HTMLInputElement | undefined = this._dateInputElementRef()?.nativeElement;
    if (this.shouldLabelFloat && event?.target instanceof HTMLInputElement) {
      target = event.target;
    } else if (this._form.value.date) {
      target = this._timeInputElementRef()?.nativeElement;
    }
    target?.focus(options);
  }

  _onFocus() {
    if (!this.isDisabled()) {
      this._focused = true;
      this.stateChanges.next();
    }
  }

  /**
   * Calls the touched callback only if the panel is closed. Otherwise, the trigger will
   * "blur" to the panel when it opens, causing a false positive.
   */
  _onBlur(event?: FocusEvent) {
    if (
      this.ngField &&
      (this.matDatepicker().opened || (event?.relatedTarget && this.hostElement.nativeElement.contains(event.relatedTarget as Node)))
    )
      return;
    this._focused = false;

    if (!this.isDisabled()) {
      this.touch.emit();
      this._changeDetectorRef.markForCheck();
      this.stateChanges.next();
    }
  }

  _onDateInputKeydown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'ArrowRight' && input.selectionStart === input.selectionEnd && input.selectionStart === input.value.length) {
      event.preventDefault();
      this._timeInputElementRef()?.nativeElement.focus();
    }
  }

  _onTimeInputKeydown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'ArrowLeft' && input.selectionStart === input.selectionEnd && input.selectionStart === 0) {
      event.preventDefault();
      this._dateInputElementRef()?.nativeElement.focus();
    }
  }

  /**
   * Assigns a specific value to the value property and optionally to the form bound to the inputs.
   * Returns whether the value has changed.
   **/
  private _assignValue(newValue: TDateTime | null, options: { assignForm: boolean; emitChange: boolean }) {
    const changed = newValue !== this.previousEmitted;
    if (options.assignForm && newValue !== this.value()) {
      this._form.setValue(this.dateTimeAdapter.splitDateTime(newValue), { emitEvent: false });
    }
    this.value.set(newValue);
    this.previousEmitted = newValue;
    if (options.emitChange) {
      // The legacy pipeline has to see every null, otherwise its validators don't re-run.
      if (changed || !newValue) this._notifyLegacyChange(newValue);
      if (changed) this.valueChange.emit(newValue);
    }
  }
}
