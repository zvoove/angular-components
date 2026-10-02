import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { disabled, form, required } from '@angular/forms/signals';
import { signalErrorControl, signalErrorControlSnapshot } from './legacy-control-adapter';

describe('signalErrorControlSnapshot', () => {
  it('rebuilds the snapshot only when the field state changes', () => {
    const model = signal({ name: '' });
    const fields = TestBed.runInInjectionContext(() => form(model, (path) => required(path.name, { message: 'Required' })));
    const snapshot = TestBed.runInInjectionContext(() => signalErrorControlSnapshot(() => fields.name));

    const first = snapshot();
    expect(first).toBe(snapshot());
    expect(first!.errors).toEqual({ required: expect.objectContaining({ kind: 'required' }) });
    expect(first!.touched).toBe(false);

    fields.name().markAsTouched();
    const second = snapshot();
    expect(second).not.toBe(first);
    expect(second!.touched).toBe(true);
    expect(second).toBe(snapshot());

    model.set({ name: 'filled' });
    expect(snapshot()!.errors).toBeNull();
  });

  it('mirrors a disabled field as a disabled, non-invalid snapshot', () => {
    const model = signal({ name: '' });
    const fields = TestBed.runInInjectionContext(() =>
      form(model, (path) => {
        required(path.name, { message: 'Required' });
        disabled(path.name);
      })
    );
    const control = TestBed.runInInjectionContext(() => signalErrorControl(fields.name));

    expect(control.disabled).toBe(true);
    // Matches reactive forms: a disabled control is never invalid, so the default
    // ErrorStateMatcher does not light up a disabled signal field.
    expect(control.invalid).toBe(false);
  });
});
