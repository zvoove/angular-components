import { Component, Injectable, computed, inject, input, model, output, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { FORM_FIELD, Field, FormValueControl, FormField, form, required } from '@angular/forms/signals';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  ZV_NATIVE_DATE_FORMATS,
  ZV_NATIVE_TIME_FORMATS,
  ZvNativeDateAdapter,
  ZvNativeDateTimeAdapter,
  ZvNativeTimeAdapter,
  provideDateTimeAdapters,
  provideDateTimeFormats,
} from '@zvoove/components/core';
import { ZvDateTimeInput, ZvTimeInput } from '@zvoove/components/date-time-input';
import { ZvFileInput } from '@zvoove/components/file-input';
import { ZvNumberInput } from '@zvoove/components/number-input';
import { DefaultZvSelectDataSource, ZvSelect } from '@zvoove/components/select';
import { BaseZvFormService, IZvFormErrorData, provideFormService } from '@zvoove/components/form-base';
import { Subject, of } from 'rxjs';
import { ZvFormField, ZV_FORM_FIELD_CONFIG } from './form-field.component';

@Injectable({ providedIn: 'root' })
class LegacyService extends BaseZvFormService {
  getLabel() {
    return of('Legacy label');
  }
  protected mapDataToError(data: IZvFormErrorData[]) {
    return of(data.map((error) => ({ data: error, errorText: error.errorKey })));
  }
}

// Consumer-style controls: no dependency on the migrated controls or their adapter.
@Component({
  selector: 'zv-external-legacy',
  template: '<input [value]="value" (input)="edit($any($event.target).value)" />',
  providers: [{ provide: MatFormFieldControl, useExisting: LegacyMaterialControl }],
})
class LegacyMaterialControl implements ControlValueAccessor, MatFormFieldControl<string> {
  readonly ngControl = inject(NgControl, { self: true });
  id = 'legacy';
  value = '';
  focused = false;
  empty = true;
  shouldLabelFloat = false;
  required = false;
  disabled = false;
  errorState = false;
  controlType = 'consumer-legacy';
  readonly stateChanges = new Subject<void>();
  private change = (_value: string) => {};
  constructor() {
    this.ngControl.valueAccessor = this;
  }
  edit(value: string) {
    this.value = value;
    this.change(value);
    this.stateChanges.next();
  }
  writeValue(value: string) {
    this.value = value;
    this.empty = !value;
    this.stateChanges.next();
  }
  registerOnChange(fn: (value: string) => void) {
    this.change = fn;
  }
  registerOnTouched() {}
  setDisabledState(value: boolean) {
    this.disabled = value;
  }
  setDescribedByIds() {}
  onContainerClick() {}
}

@Component({
  selector: 'zv-external-signal',
  template: '<input [value]="value()" (input)="value.set($any($event.target).value)" (blur)="touch.emit()" />',
  providers: [{ provide: MatFormFieldControl, useExisting: SignalMaterialControl }],
})
class SignalMaterialControl implements FormValueControl<string>, MatFormFieldControl<string> {
  readonly value = model('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly touch = output<void>();
  readonly focused = signal(false);
  readonly empty = computed(() => !this.value());
  readonly shouldLabelFloat = computed(() => !this.empty());
  readonly errorState = computed(() => this.invalid() && this.touched());
  readonly ngControl: null = null;
  readonly id = 'external-signal';
  private readonly binding = inject(FORM_FIELD, { optional: true, self: true });
  get ngField() {
    return (this.binding?.field() as Field<string>) ?? null;
  }
  setDescribedByIds() {}
  onContainerClick() {}
}

@Component({
  imports: [ReactiveFormsModule, FormField, ZvFormField, LegacyMaterialControl, SignalMaterialControl],
  providers: [provideFormService(LegacyService)],
  template:
    '<zv-form-field hint="legacy"><zv-external-legacy [formControl]="control" /></zv-form-field><zv-form-field><zv-external-signal [formField]="fields.text" /></zv-form-field>',
})
class ExternalHost {
  readonly control = new FormControl('', { nonNullable: true, validators: Validators.required });
  readonly data = signal({ text: '' });
  readonly fields = form(this.data, (path) => required(path.text, { message: 'External required' }));
  readonly legacy = viewChild(LegacyMaterialControl);
}

@Component({
  imports: [
    FormField,
    ZvFormField,
    ZvFileInput,
    ZvNumberInput,
    ZvDateTimeInput,
    ZvTimeInput,
    ZvSelect,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  providers: [
    provideFormService(LegacyService),
    { provide: ZV_FORM_FIELD_CONFIG, useValue: { requiredText: 'Required' } },
    provideDateTimeAdapters(ZvNativeDateTimeAdapter, ZvNativeDateAdapter, ZvNativeTimeAdapter),
    provideDateTimeFormats(ZV_NATIVE_DATE_FORMATS, ZV_NATIVE_TIME_FORMATS),
  ],
  template: `
    <zv-form-field hint="Hint" id="dynamic">
      <mat-label>Dynamic</mat-label>
      @if (showNumber()) {
        <zv-number-input [formField]="fields.number" />
      } @else {
        <input matInput [formField]="fields.text" />
      }
    </zv-form-field>
    <zv-form-field><mat-label>Attachment</mat-label><zv-file-input [formField]="fields.file" /></zv-form-field>
    <zv-form-field><mat-label>Select</mat-label><zv-select [dataSource]="options" [formField]="fields.choice" /></zv-form-field>
    <zv-form-field
      ><mat-label>Date</mat-label><zv-date-time-input [matDatepicker]="picker" [formField]="fields.date" /><mat-datepicker #picker
    /></zv-form-field>
    <zv-form-field><mat-label>Time</mat-label><input id="time" matInput zvTime [formField]="fields.time" /></zv-form-field>
    <zv-form-field><mat-checkbox [formField]="fields.checked">Checked</mat-checkbox></zv-form-field>
    <zv-form-field><mat-label>Value only</mat-label><zv-number-input [value]="3" /></zv-form-field>
  `,
})
class Host {
  readonly initial = {
    number: null as number | null,
    file: null as File | null,
    choice: null as string | null,
    date: null as Date | null,
    time: null as { hours: number; minutes: number } | null,
    text: '',
    checked: false,
  };
  readonly data = signal(this.initial);
  readonly fields = form(this.data, (path) => required(path.number, { message: 'Pick a number' }));
  readonly showNumber = signal(true);
  readonly file = viewChild(ZvFileInput);
  readonly select = viewChild(ZvSelect);
  readonly options = new DefaultZvSelectDataSource<string>({
    mode: 'id',
    idKey: 'id',
    labelKey: 'label',
    items: [{ id: 'red', label: 'Red' }],
  });
}

describe('Signal controls in zv-form-field', () => {
  it('supports unchanged external legacy controls and signal controls without stateChanges', async () => {
    const fixture = TestBed.createComponent(ExternalHost);
    await fixture.whenStable();
    expect(fixture.componentInstance.legacy()!.required).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Legacy label');
    fixture.componentInstance.fields.text().markAsTouched();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('External required');
    fixture.componentInstance.control.setValue('external');
    await fixture.whenStable();
    expect(fixture.componentInstance.legacy()!.value).toBe('external');
  });
  it('maps explicit errors, required hints and reconnects replaced content', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const wrapper = () => fixture.nativeElement.querySelector('#dynamic') as HTMLElement;
    expect(wrapper().textContent).toContain('Required. Hint');
    const input = wrapper().querySelector('input')!;
    const labelId = input.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)?.textContent).toContain('Dynamic');
    host.fields.number().markAsTouched();
    await fixture.whenStable();
    expect(wrapper().textContent).toContain('Pick a number');
    host.showNumber.set(false);
    await fixture.whenStable();
    expect(wrapper().textContent).not.toContain('Pick a number');
    expect(wrapper().textContent).not.toContain('Required. Hint');
    expect(wrapper().classList.contains('zv-form-field-type-zv-number-input')).toBe(false);
    host.showNumber.set(true);
    await fixture.whenStable();
    expect(wrapper().textContent).toContain('Pick a number');
  });

  it('propagates file/select edits and standalone adapter time values', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const file = new File(['x'], 'example.txt');
    host.file()!.setFile(file);
    host.select()!.onValueChange('red');
    const time = fixture.nativeElement.querySelector('#time') as HTMLInputElement;
    time.value = '10:30';
    time.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(host.data().file).toBe(file);
    expect(host.data().choice).toBe('red');
    expect(host.data().time).toEqual({ hours: 10, minutes: 30 });
    time.value = 'invalid';
    time.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(
      host.fields
        .time()
        .errors()
        .some((error) => error.kind === 'zvTimeInputParse')
    ).toBe(true);
    host.fields().reset(host.initial);
    await fixture.whenStable();
    expect(time.value).toBe('');
    expect(host.fields.time().errors()).toEqual([]);
    expect(host.file()!.value()).toBeNull();
  });

  it('keeps programmatic signal updates pristine and uses custom error matchers', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const date = new Date(2020, 0, 2, 10, 30);
    host.data.update((value) => ({ ...value, date: date, number: 4, choice: 'red' }));
    await fixture.whenStable();
    expect(host.fields.date().dirty()).toBe(false);
    expect(host.fields.number().dirty()).toBe(false);
    expect(host.fields.choice().dirty()).toBe(false);
    const select = host.select()!;
    let receivedValue: unknown;
    select.errorStateMatcher = {
      isErrorState: (control) => {
        receivedValue = control?.value;
        return !!control?.dirty;
      },
    };
    expect(select.errorState).toBe(false);
    expect(receivedValue).toBe('red');
    host.fields.choice().markAsDirty();
    expect(select.errorState).toBe(true);
  });

  it('reports repeated null parse errors and clears partial date/time text on reset', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const date = fixture.nativeElement.querySelector('.zv-date-time__date') as HTMLInputElement;
    for (const value of ['bad', 'still bad']) {
      date.value = value;
      date.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      expect(host.data().date).toBeNull();
      expect(
        host.fields
          .date()
          .errors()
          .some((error) => error.kind === 'matDatepickerParse')
      ).toBe(true);
      expect(date.value).toBe(value);
    }
    host.fields().reset(host.initial);
    await fixture.whenStable();
    expect(date.value).toBe('');
    expect(host.fields.date().errors()).toEqual([]);
  });
});
