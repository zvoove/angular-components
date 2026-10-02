import { DestroyRef, OutputRef, Signal, computed, inject } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NgControl, ValidatorFn } from '@angular/forms';
import { Field } from '@angular/forms/signals';
import { hasRequiredField } from './helpers';
import { ZvFormService } from './form.service';

/** Pushes a view -> model change into the legacy forms pipeline. No-op outside legacy forms. */
export type LegacyChangeNotifier<T> = (value: T) => void;

/**
 * Angular 22.2's native legacy-form bridge commits every edit immediately. Keep the
 * CVA protocol outside signal controls so Angular retains updateOn blur/submit.
 * The guard also allows controls whose historical output includes model writes.
 *
 * Returns the notifier the control must call for every view-originated change. It is kept
 * separate from the control's public `valueChange` output on purpose: the two have never had
 * the same trigger conditions (`[value]` writes through to the form control without emitting
 * `valueChange`, `writeValue` does the reverse), so driving one from the other would change
 * both contracts.
 */
export function connectLegacyControl<T>(
  ngControl: NgControl | null,
  touch: OutputRef<void>,
  write: (value: T) => void,
  disable: (disabled: boolean) => void
): LegacyChangeNotifier<T> {
  if (!ngControl) return () => {};
  let writing = false;
  let onChange = (_value: T) => {};
  let onTouched = () => {};
  const adapter: ControlValueAccessor = {
    writeValue: function (value: T) {
      writing = true;
      try {
        write(value);
      } finally {
        writing = false;
      }
    },
    registerOnChange: function (fn: (value: T) => void) {
      onChange = fn;
    },
    registerOnTouched: function (fn: () => void) {
      onTouched = fn;
    },
    setDisabledState: disable,
  };
  ngControl.valueAccessor = adapter;
  const touches = touch.subscribe(() => onTouched());
  inject(DestroyRef).onDestroy(() => touches.unsubscribe());
  return (value: T) => {
    if (!writing) onChange(value);
  };
}

/**
 * Mirrors the required state of a legacy form control onto the control's own `required` model.
 *
 * `ZvFormField` used to do this for every control, so the detection has to stay identical:
 * `hasRequiredField` runs the composed validator and looks for a `required` error, which also
 * catches `Validators.compose(...)` and custom validators that `hasValidator(Validators.required)`
 * would miss. The `ZvFormService.tryDetectRequired` opt-out is honored as well.
 *
 * Returns `null` when nothing should be inferred, so an explicit `[required]` binding wins.
 * Must be called from an injection context.
 */
export function createRequiredDetector(ngControl: NgControl | null): () => boolean | null {
  const formService = inject(ZvFormService, { optional: true });
  let lastControl: AbstractControl | null = null;
  let lastValidator: ValidatorFn | null = null;
  let lastResult = false;
  return () => {
    const control = ngControl?.control ?? null;
    if (!control || !(formService?.tryDetectRequired ?? true)) return null;
    // Runs on every change detection cycle, so only re-evaluate when the validators changed.
    if (control !== lastControl || control.validator !== lastValidator) {
      lastControl = control;
      lastValidator = control.validator;
      lastResult = hasRequiredField(control);
    }
    return lastResult;
  };
}

/**
 * Read-only snapshot for existing ErrorStateMatcher implementations on signal fields.
 *
 * Note that a disabled field is never `invalid`, mirroring reactive forms.
 */
export function signalErrorControl<T>(field: Field<T>): FormControl<T> {
  const state = field();
  const disabled = state.disabled();
  // Constructed as disabled rather than calling disable() afterwards, because disable() nulls
  // out the errors. The control still reports status DISABLED once the errors are attached, so
  // a custom matcher can read control.errors while control.invalid stays false.
  const control = new FormControl<T>({ value: state.value(), disabled: disabled }, { nonNullable: true });
  const errors = state.errors();
  control.setErrors(errors.length ? Object.fromEntries(errors.map((error) => [error.kind, error])) : null, { emitEvent: false });
  if (state.touched()) control.markAsTouched({ emitEvent: false });
  if (state.dirty()) control.markAsDirty({ emitEvent: false });
  if (!disabled && state.pending()) control.markAsPending({ emitEvent: false });
  return control;
}

/**
 * Memoized {@link signalErrorControl}. `errorState` is read several times per change detection
 * cycle (host bindings, the template and `mat-form-field`), so the snapshot is only rebuilt when
 * the field state actually changes. The matcher and the parent form's submitted state are still
 * evaluated on every read, because neither of them is reactive.
 */
export function signalErrorControlSnapshot<T>(field: () => Field<T> | null): Signal<FormControl<T> | null> {
  return computed(() => {
    const current = field();
    return current ? signalErrorControl(current) : null;
  });
}
