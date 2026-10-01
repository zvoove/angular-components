import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, debounce, form, required } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ZvNumberInput } from './number-input.component';

@Component({
  imports: [ZvNumberInput, FormField, ReactiveFormsModule, FormsModule, MatFormFieldModule],
  template: `
    <mat-form-field><zv-number-input id="signal" [formField]="fields.number" (valueChange)="events.push($event)" /></mat-form-field>
    <zv-number-input id="reactive" [formControl]="control" />
    <form [formGroup]="group"><zv-number-input id="submit" formControlName="number" /></form>
    <form><zv-number-input id="template" name="number" [(ngModel)]="templateValue" /></form>
    <zv-number-input id="direct" [(value)]="directValue" (valueChange)="directEvents.push($event)" />
  `,
})
class Host {
  readonly data = signal({ number: null as number | null });
  readonly fields = form(this.data, (path) => {
    required(path.number);
    debounce(path.number, 'blur');
  });
  readonly control = new FormControl<number | null>(1, { updateOn: 'blur', validators: Validators.required });
  readonly group = new FormGroup({ number: new FormControl<number | null>(1, { updateOn: 'submit' }) });
  templateValue: number | null = 3;
  directValue: number | null = 4;
  readonly events: (number | null)[] = [];
  readonly directEvents: (number | null)[] = [];
}

describe('ZvNumberInput public binding compatibility', () => {
  it('supports signal blur rules, delayed legacy forms, named ngModel and repeated direct outputs', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const input = (id: string): HTMLInputElement => fixture.nativeElement.querySelector(`#${id} input`);
    const edit = (id: string, value: string) => {
      input(id).value = value;
      input(id).dispatchEvent(new Event('input'));
    };
    const blur = (id: string) => input(id).dispatchEvent(new Event('blur'));
    expect(input('template').value).toBe('3');
    expect(input('direct').value).toBe('4');
    edit('signal', '5');
    await fixture.whenStable();
    expect(host.data().number).toBeNull();
    blur('signal');
    await fixture.whenStable();
    expect(host.data().number).toBe(5);
    expect(host.fields.number().touched()).toBe(true);
    expect(host.events).toEqual([5]);
    edit('reactive', '6');
    expect(host.control.value).toBe(1);
    blur('reactive');
    expect(host.control.value).toBe(6);
    edit('submit', '7');
    blur('submit');
    expect(host.group.controls.number.value).toBe(1);
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(host.group.controls.number.value).toBe(7);
    edit('template', '8');
    expect(host.templateValue).toBe(8);
    edit('direct', '9');
    edit('direct', '9');
    expect(host.directValue).toBe(9);
    expect(host.directEvents).toEqual([9, 9]);
    host.control.reset();
    host.fields().reset({ number: null });
    await fixture.whenStable();
    expect(input('reactive').value).toBe('');
    expect(input('signal').value).toBe('');
  });
});
