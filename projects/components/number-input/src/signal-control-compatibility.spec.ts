/* eslint-disable @angular-eslint/no-input-rename -- Reproduces the compatibility value adapter. */
import { Component, Input, model, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';

@Component({ selector: 'zv-test-signal-control', template: '' })
class SignalControl implements FormValueControl<number | null> {
  readonly value = model<number | null>(null, { alias: 'modelValue' });
  // eslint-disable-next-line @angular-eslint/prefer-signals -- Exercises the legacy-compatible public setter.
  @Input('value')
  set valueInput(value: number | null) {
    this.value.set(value);
  }
  readonly valueChange = output<number | null>();
  readonly touch = output<void>();
}

@Component({
  imports: [ReactiveFormsModule, SignalControl],
  template: '<zv-test-signal-control [formControl]="control" (valueChange)="events.push($event)" />',
})
class Host {
  readonly events: (number | null)[] = [];
  readonly control = new FormControl<number | null>(1, { updateOn: 'blur' });
}

describe('Angular native signal-control compatibility gate', () => {
  it('documents Angular 22.2 immediate commits despite updateOn blur', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const control = fixture.debugElement.children[0].componentInstance as SignalControl;
    control.value.set(2);
    control.valueChange.emit(2);
    expect(fixture.componentInstance.events).toEqual([2]);
    expect(fixture.componentInstance.control.value).toBe(2);
    control.touch.emit();
    expect(fixture.componentInstance.control.value).toBe(2);
  });
});
