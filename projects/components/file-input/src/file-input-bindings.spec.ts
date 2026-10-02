import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { ZvFileInput } from './file-input.component';

@Component({
  imports: [ZvFileInput, ReactiveFormsModule, FormsModule, FormField],
  template: `
    <zv-file-input id="signal" [formField]="fields.file" (valueChange)="events.push($event)" />
    <zv-file-input id="reactive" [formControl]="control" />
    <form><zv-file-input id="template" name="attachment" [(ngModel)]="templateValue" /></form>
    <zv-file-input id="direct" [(value)]="directValue" />
  `,
})
class Host {
  readonly data = signal({ file: null as File | null });
  readonly fields = form(this.data);
  readonly control = new FormControl<File | null>(null, { updateOn: 'blur' });
  templateValue: File | null = null;
  directValue: File | null = null;
  readonly events: (File | null)[] = [];
}

describe('ZvFileInput public bindings', () => {
  it('supports selection, clearing, same-file reselection and resets in every binding mode', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const file = new File(['contents'], 'same.txt');
    const input = (id: string): HTMLInputElement => fixture.nativeElement.querySelector(`#${id} input`);
    for (const id of ['signal', 'reactive', 'template', 'direct']) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input(id).files = transfer.files;
      input(id).dispatchEvent(new Event('change'));
    }
    await fixture.whenStable();
    expect(host.data().file).toBe(file);
    expect(host.control.value).toBe(file);
    expect(host.templateValue).toBe(file);
    expect(host.directValue).toBe(file);
    expect(host.events).toEqual([file]);
    (fixture.nativeElement.querySelector('#signal .app-file-input__remove') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(input('signal').value).toBe('');
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input('signal').files = transfer.files;
    input('signal').dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(host.events).toEqual([file, null, file]);
    host.control.reset();
    host.fields().reset({ file: null });
    await fixture.whenStable();
    expect(input('reactive').value).toBe('');
    expect(input('signal').value).toBe('');
    host.control.disable();
    await fixture.whenStable();
    expect(input('reactive').disabled).toBe(true);
  });
});
