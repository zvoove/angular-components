/* eslint-disable @angular-eslint/no-input-rename -- Preserve value binding and explicit event semantics. */
/* eslint-disable @angular-eslint/prefer-signals -- The value adapter preserves the public input and event contract. */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, Input, OnDestroy, OnInit, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { AbstractControl, NgControl, ValidationErrors } from '@angular/forms';
import { FORM_FIELD, FormValueControl, transformedValue } from '@angular/forms/signals';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/input';
import { ZV_TIME_FORMATS, ZvTimeAdapter, ZvTimeFormats } from '@zvoove/components/core';
import { connectLegacyControl } from '@zvoove/components/form-base';
import { Subject } from 'rxjs';

export class ZvTimeInputEvent<TTime> {
  value: TTime | null;
  constructor(
    public target: ZvTimeInput<TTime>,
    public targetElement: HTMLElement
  ) {
    this.value = target.value();
  }
}

@Directive({
  selector: 'input[zvTime]',
  providers: [{ provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: ZvTimeInput }],
  host: {
    class: 'zv-time-input',
    '[disabled]': 'isDisabled()',
    '[readOnly]': 'readonly()',
    '(input)': '_onInput($any($event.target).value)',
    '(change)': '_onChange()',
    '(blur)': '_onBlur()',
  },
  exportAs: 'matTimeInput',
})
export class ZvTimeInput<TTime> implements FormValueControl<TTime | null>, OnInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly adapter = inject<ZvTimeAdapter<TTime>>(ZvTimeAdapter, { optional: true });
  private readonly formats = inject<ZvTimeFormats>(ZV_TIME_FORMATS, { optional: true });
  readonly ngControl = inject(FORM_FIELD, { optional: true, self: true }) ? null : inject(NgControl, { optional: true, self: true });
  readonly value = model<TTime | null>(null, { alias: 'modelValue' });
  readonly valueChange = output<TTime | null>();
  readonly touch = output<void>();
  readonly disabled = input(false, { transform: coerceBooleanProperty });
  readonly readonly = input(false, { transform: coerceBooleanProperty });
  private readonly legacyDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.legacyDisabled());
  readonly timeChange = output<ZvTimeInputEvent<TTime>>();
  readonly timeInput = output<ZvTimeInputEvent<TTime>>();
  readonly stateChanges = new Subject<void>();
  private validatorChanged = () => {};
  private readonly validator = (control: AbstractControl) => this.validate(control);
  private readonly raw = transformedValue(this.value, {
    parse: (text: string) => {
      const parsed = this.adapter?.parse(text, this.formats?.parse.timeInput) ?? null;
      const valid = !parsed || !!this.adapter?.isValid(parsed);
      return {
        value: this.adapter?.getValidTimeOrNull(parsed) ?? null,
        error: valid ? undefined : { kind: 'zvTimeInputParse', text: text },
      };
    },
    format: (value) => (value == null ? '' : (this.adapter?.format(value, this.formats?.display.timeInput) ?? '')),
  });

  @Input('value')
  set valueInput(value: TTime | null) {
    const parsed = this.adapter?.deserialize(value) ?? null;
    const next = this.adapter?.getValidTimeOrNull(parsed) ?? null;
    if (!this.adapter?.sameTime(next, this.value())) {
      this.value.set(next);
      this.element.value = next == null ? '' : (this.adapter?.format(next, this.formats?.display.timeInput) ?? '');
    }
  }

  constructor() {
    connectLegacyControl(
      this.ngControl,
      this.valueChange,
      this.touch,
      (value) => {
        this.valueInput = value;
        this.reset();
      },
      (disabled) => this.legacyDisabled.set(disabled)
    );
    effect(() => {
      this.element.value = this.raw();
      this.stateChanges.next();
    });
  }

  ngOnInit() {
    this.ngControl?.control?.addValidators(this.validator);
    this.ngControl?.control?.updateValueAndValidity({ emitEvent: false });
  }
  ngOnDestroy() {
    this.ngControl?.control?.removeValidators(this.validator);
    this.stateChanges.complete();
  }
  registerOnValidatorChange(fn: () => void) {
    this.validatorChanged = fn;
  }
  validate(_control: AbstractControl): ValidationErrors | null {
    const errors = this.raw.parseErrors();
    return errors.length ? { zvTimeInputParse: { text: this.element.value } } : null;
  }
  reset() {
    const value = this.value();
    this.raw.set(value == null ? '' : (this.adapter?.format(value, this.formats?.display.timeInput) ?? ''));
    this.element.value = this.raw();
    this.validatorChanged();
  }
  focus(options?: FocusOptions) {
    this.element.focus(options);
  }
  _onInput(text: string) {
    const previous = this.value();
    this.raw.set(text);
    const value = this.value();
    const changed = !(this.adapter?.sameTime(value, previous) ?? false);
    if (!value || changed) this.valueChange.emit(value);
    this.validatorChanged();
    if (changed) this.timeInput.emit(new ZvTimeInputEvent(this, this.element));
    this.stateChanges.next();
  }
  _onChange() {
    this.timeChange.emit(new ZvTimeInputEvent(this, this.element));
  }
  _onBlur() {
    if (this.value()) this.element.value = this.adapter?.format(this.value(), this.formats?.display.timeInput) ?? '';
    this.touch.emit();
  }
}
