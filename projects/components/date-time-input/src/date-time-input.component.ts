import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgControl,
  NgForm,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
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
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
  },
  providers: [{ provide: MatFormFieldControl, useExisting: ZvDateTimeInput }],
})
export class ZvDateTimeInput<TDateTime, TDate, TTime>
  implements ControlValueAccessor, MatFormFieldControl<TDateTime>, OnChanges, OnInit, DoCheck
{
  public _changeDetectorRef = inject(ChangeDetectorRef);
  _defaultErrorStateMatcher = inject(ErrorStateMatcher);
  _parentForm = inject(NgForm, { optional: true });
  _parentFormGroup = inject(FormGroupDirective, { optional: true });
  _parentFormField = inject(MAT_FORM_FIELD, { optional: true });
  ngControl = inject(NgControl, { optional: true, self: true });
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

  @Input({ required: true }) public matDatepicker!: MatDatepickerPanel<MatDatepickerControl<unknown>, unknown, unknown>;

  /** Value of the date-time control. */
  @Input()
  get value(): TDateTime | null {
    return this._value;
  }
  set value(newValue: TDateTime | null) {
    this._assignValue(newValue, { assignForm: true, emitChange: true });
  }
  private _value: TDateTime | null = null;
  @Output() public readonly valueChange = new EventEmitter<TDateTime | null>();

  /** Placeholder to be shown if no value has been selected. (not supported for this component!) */
  public readonly placeholder = '';

  /** Whether the input is focused. */
  get focused(): boolean {
    return this._focused;
  }
  private _focused = false;

  @Input({ transform: booleanAttribute })
  public disabled = false;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  readonly stateChanges: Subject<void> = new Subject<void>();

  /** Whether the control is empty. */
  get empty(): boolean {
    if (!this._dateInputElementRef || !this._timeInputElementRef) {
      return this.value == null;
    }
    return !this._dateInputElementRef.nativeElement.value && !this._timeInputElementRef.nativeElement.value;
  }

  /** Whether the `MatFormField` label should try to float. */
  get shouldLabelFloat(): boolean {
    return !this.empty || this._focused;
  }

  /** Whether the component is required. */
  @Input()
  get required(): boolean {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required: boolean | undefined;

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

  datePlaceholder = this.dateTimeAdapter.dateAdapter.parseFormatExample();
  timePlaceholder = this.dateTimeAdapter.timeAdapter.parseFormatExample();

  /** `View -> model callback called when value changes` */
  _onChange: (value: any) => void = () => {};

  /** `View -> model callback called when input has been touched` */
  _onTouched = () => {};

  /** `Callback called when validators have been changed` */
  _validatorOnChange = () => {};

  _form = new FormGroup({
    date: new FormControl<TDate | null>(null),
    time: new FormControl<TTime | null>(null),
  });

  @ViewChild('date') _dateInputElementRef!: ElementRef<HTMLInputElement>;
  @ViewChild('time') _timeInputElementRef!: ElementRef<HTMLInputElement>;
  _errorStateTracker: _ErrorStateTracker;

  constructor() {
    if (this.ngControl) {
      // Note: we provide the value accessor through here, instead of
      // the `providers` to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this._assignValue(newValue, { assignForm: false, emitChange: true });

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
      this.ngControl.control!.addValidators(this.validate.bind(this));
      this.ngControl.control!.updateValueAndValidity();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.disabled) {
      this.setDisabledState(this.disabled);
    }
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
   * @docs-private
   */
  setDescribedByIds(ids: string[]) {
    this._ariaDescribedby = ids.join(' ');
  }

  @ViewChild(MatDatepickerInput) public matDateInput!: MatDatepickerInput<TDate>;
  @ViewChild(ZvTimeInput) public zvTimeInput!: ZvTimeInput<TTime>;
  _childValidators: ValidatorFn[] = [(control) => this.matDateInput?.validate(control), (control) => this.zvTimeInput?.validate(control)];
  validate(control: AbstractControl): Record<string, any> | null {
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

  /**
   * Sets the input's value. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param value New value to be written to the model.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeValue(value: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this._assignValue(value, { assignForm: true, emitChange: false });
  }

  /**
   * Saves a callback function to be invoked when the input's value
   * changes from user input. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param fn Callback to be triggered when the value changes.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  /**
   * Saves a callback function to be invoked when the input is blurred
   * by the user. Part of the ControlValueAccessor interface required
   * to integrate with Angular's core forms API.
   *
   * @param fn Callback to be triggered when the component has been touched.
   */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /**
   * Disables the input. Part of the ControlValueAccessor interface required
   * to integrate with Angular's core forms API.
   *
   * @param isDisabled Sets whether the component is disabled.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this._form.disable();
    } else {
      this._form.enable();
    }
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
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
    let target = this._dateInputElementRef.nativeElement;
    if (this.shouldLabelFloat && event?.target instanceof HTMLInputElement) {
      target = event.target;
    } else if (this._form.value.date) {
      target = this._timeInputElementRef.nativeElement;
    }
    target.focus(options);
  }

  _onFocus() {
    if (!this.disabled) {
      this._focused = true;
      this.stateChanges.next();
    }
  }

  /**
   * Calls the touched callback only if the panel is closed. Otherwise, the trigger will
   * "blur" to the panel when it opens, causing a false positive.
   */
  _onBlur(_formatTime = false) {
    this._focused = false;

    if (!this.disabled) {
      this._onTouched();
      this._changeDetectorRef.markForCheck();
      this.stateChanges.next();
    }
  }

  _onDateInputKeydown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'ArrowRight' && input.selectionStart === input.selectionEnd && input.selectionStart === input.value.length) {
      event.preventDefault();
      this._timeInputElementRef.nativeElement.focus();
    }
  }

  _onTimeInputKeydown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'ArrowLeft' && input.selectionStart === input.selectionEnd && input.selectionStart === 0) {
      event.preventDefault();
      this._dateInputElementRef.nativeElement.focus();
    }
  }

  /**
   * Assigns a specific value to the value property and optionally to the form bound to the inputs.
   * Returns whether the value has changed.
   **/
  private _assignValue(newValue: TDateTime | null, options: { assignForm: boolean; emitChange: boolean }) {
    if (newValue !== this._value) {
      this._value = newValue;
      if (options.assignForm) {
        const parts = this.dateTimeAdapter.splitDateTime(newValue);
        this._form.setValue(parts);
      }
      if (options.emitChange) {
        this._onChange(this._value);
        this.valueChange.emit(this._value);
      }
    }
    // We need to fire the CVA change event for all
    // nulls, otherwise the validators won't run.
    else if (!newValue && options.emitChange) {
      this._onChange(this._value);
    }
  }
}
