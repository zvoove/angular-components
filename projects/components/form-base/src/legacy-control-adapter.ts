import { DestroyRef, OutputRef, inject } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { Field } from '@angular/forms/signals';

/**
 * Angular 22.2's native legacy-form bridge commits every edit immediately. Keep the
 * CVA protocol outside signal controls so Angular retains updateOn blur/submit.
 * The guard also allows controls whose historical output includes model writes.
 */
export function connectLegacyControl<T>(
  ngControl: NgControl | null,
  change: OutputRef<T>,
  touch: OutputRef<void>,
  write: (value: T) => void,
  disable: (disabled: boolean) => void
): void {
  if (!ngControl) return;
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
  const changes = change.subscribe((value) => {
    if (!writing) onChange(value);
  });
  const touches = touch.subscribe(() => onTouched());
  inject(DestroyRef).onDestroy(() => {
    changes.unsubscribe();
    touches.unsubscribe();
  });
}

/** Read-only snapshot for existing ErrorStateMatcher implementations on signal fields. */
export function signalErrorControl<T>(field: Field<T>): FormControl<T> {
  const control = new FormControl(field().value(), { nonNullable: true });
  const errors = field().errors();
  control.setErrors(errors.length ? Object.fromEntries(errors.map((error) => [error.kind, error])) : null);
  if (field().touched()) control.markAsTouched();
  if (field().dirty()) control.markAsDirty();
  if (field().pending()) control.markAsPending();
  if (field().disabled()) control.disable();
  return control;
}
