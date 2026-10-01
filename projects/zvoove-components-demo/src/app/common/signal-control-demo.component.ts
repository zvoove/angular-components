import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormField, disabled, form, max, min, readonly, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
import { ZvFormField } from '@zvoove/components/form-field';
import { ZvNumberInput } from '@zvoove/components/number-input';
import { DefaultZvSelectDataSource, ZvSelect } from '@zvoove/components/select';
import { FormControlDemoCard } from './form-control-card/form-control-demo-card.component';

@Component({
  selector: 'app-signal-control-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    FormControlDemoCard,
    ZvFormField,
    ZvNumberInput,
    ZvFileInput,
    ZvSelect,
    ZvDateTimeInput,
    ZvTimeInput,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  providers: [
    provideDateTimeAdapters(ZvNativeDateTimeAdapter, ZvNativeDateAdapter, ZvNativeTimeAdapter),
    provideDateTimeFormats(ZV_NATIVE_DATE_FORMATS, ZV_NATIVE_TIME_FORMATS),
  ],
  template: `
    <app-form-control-demo-card type="signal" [field]="activeField()" [codeFiles]="code()">
      <mat-checkbox [checked]="locked()" (change)="locked.set($event.checked)">Disabled (schema)</mat-checkbox>
      <mat-checkbox [checked]="readOnly()" (change)="readOnly.set($event.checked)">Readonly (schema)</mat-checkbox>
      <mat-checkbox [checked]="visible()" (change)="visible.set($event.checked)">Show control</mat-checkbox>
      @if (visible()) {
        @switch (kind()) {
          @case ('number') {
            <zv-form-field hint="Choose a number from 0 to 20" [hintToggle]="true"
              ><mat-label>Number</mat-label
              ><zv-number-input [formField]="fields.number" [stepSize]="stepSize()" [decimals]="decimals()" [placeholder]="placeholder()"
            /></zv-form-field>
          }
          @case ('file') {
            <zv-form-field hint="Select a file, then clear or reset it"
              ><mat-label>Attachment</mat-label><zv-file-input [formField]="fields.file"
            /></zv-form-field>
          }
          @case ('select') {
            <zv-form-field hint="Select one option"
              ><mat-label>Choice</mat-label><zv-select [dataSource]="options" [formField]="fields.choice"
            /></zv-form-field>
            <zv-form-field hint="Select several options"
              ><mat-label>Multiple choices</mat-label
              ><zv-select [multiple]="true" [dataSource]="multipleOptions" [formField]="fields.choices"
            /></zv-form-field>
          }
          @case ('date-time') {
            <zv-form-field hint="Try an invalid date or a time without a date"
              ><mat-label>Date and time</mat-label
              ><zv-date-time-input [matDatepicker]="picker" [formField]="fields.dateTime" /><mat-datepicker #picker
            /></zv-form-field>
            <zv-form-field hint="Standalone adapter-based time"
              ><mat-label>Time</mat-label><input matInput zvTime [formField]="fields.time"
            /></zv-form-field>
            @for (error of fields.time().errors(); track $index) {
              <p>{{ error.kind }}</p>
            }
          }
          @case ('wrapper') {
            <zv-form-field hint="Signal-bound Material input" [hintToggle]="true"
              ><mat-label>Name</mat-label><input matInput [formField]="fields.name"
            /></zv-form-field>
            <zv-form-field hint="Signal-bound emulated Material control"
              ><mat-checkbox [formField]="fields.accepted">Accepted</mat-checkbox></zv-form-field
            >
          }
        }
      }
      <button mat-stroked-button (click)="reset()">Reset</button>
    </app-form-control-demo-card>
  `,
})
export class SignalControlDemo {
  readonly kind = input.required<'number' | 'file' | 'select' | 'date-time' | 'wrapper'>();
  readonly disabledSetting = input(false);
  readonly readonlySetting = input(false);
  readonly requiredSetting = input(true);
  readonly minValue = input(0);
  readonly maxValue = input(20);
  readonly stepSize = input(1);
  readonly decimals = input<number | null>(null);
  readonly placeholder = input('');
  readonly locked = signal(false);
  readonly readOnly = signal(false);
  readonly visible = signal(true);
  readonly initial = {
    number: null as number | null,
    file: null as File | null,
    choice: null as string | null,
    choices: [] as string[],
    dateTime: null as Date | null,
    time: null as { hours: number; minutes: number } | null,
    name: '',
    accepted: false,
  };
  readonly data = signal(this.initial);
  readonly fields = form(this.data, (path) => {
    required(path.number, { when: () => this.requiredSetting(), message: 'Choose a number' });
    min(path.number, () => this.minValue());
    max(path.number, () => this.maxValue());
    required(path.file, { when: () => this.requiredSetting(), message: 'Select a file' });
    required(path.choice, { message: 'Select an option' });
    required(path.dateTime, { when: () => this.requiredSetting(), message: 'Enter a date and time' });
    required(path.name, { message: 'Enter a name' });
    disabled(path, { when: () => this.locked() || this.disabledSetting() });
    readonly(path, { when: () => this.readOnly() || this.readonlySetting() });
  });
  readonly options = new DefaultZvSelectDataSource<string>({
    mode: 'id',
    idKey: 'id',
    labelKey: 'label',
    items: ['Red', 'Green', 'Blue'].map((label) => ({ id: label, label: label })),
  });
  readonly multipleOptions = new DefaultZvSelectDataSource({
    mode: 'id',
    idKey: 'id',
    labelKey: 'label',
    items: ['Red', 'Green', 'Blue'].map((label) => ({ id: label, label: label })),
  });
  readonly activeField = computed(() => {
    switch (this.kind()) {
      case 'number':
        return this.fields.number();
      case 'file':
        return this.fields.file();
      case 'select':
        return this.fields.choice();
      case 'date-time':
        return this.fields.dateTime();
      case 'wrapper':
        return this.fields.name();
    }
  });
  readonly code = computed(() => {
    const name = { number: 'number', file: 'file', select: 'choice', 'date-time': 'dateTime', wrapper: 'name' }[this.kind()];
    const control = {
      number: '<zv-number-input',
      file: '<zv-file-input',
      select: '<zv-select [dataSource]="options"',
      'date-time': '<zv-date-time-input [matDatepicker]="picker"',
      wrapper: '<input matInput',
    }[this.kind()];
    return [
      {
        filename: 'example.ts',
        code: `import { signal } from '@angular/core';\nimport { form, FormField, required } from '@angular/forms/signals';\n// Add FormField and the control to component imports.\nreadonly data = signal({ ${name}: ${name === 'name' ? "''" : 'null as ' + { number: 'number', file: 'File', choice: 'string', dateTime: 'Date' }[name] + ' | null'}${name === 'dateTime' ? ', time: null as { hours: number; minutes: number } | null' : ''} });\nreadonly fields = form(this.data, p => required(p.${name}, { message: 'Required' }));`,
      },
      {
        filename: 'example.html',
        code: `<zv-form-field hint="Example">\n  <mat-label>${name}</mat-label>\n  ${control} [formField]="fields.${name}" />\n</zv-form-field>${this.kind() === 'date-time' ? '\n<mat-datepicker #picker />\n<input matInput zvTime [formField]="fields.time" />' : ''}`,
      },
    ];
  });
  setValue(value: unknown) {
    switch (this.kind()) {
      case 'number':
        this.data.update((data) => ({ ...data, number: value as number | null }));
        break;
      case 'file':
        this.data.update((data) => ({ ...data, file: value as File | null }));
        break;
      case 'date-time':
        this.data.update((data) => ({ ...data, dateTime: value as Date | null }));
        break;
      case 'select':
        this.data.update((data) => ({ ...data, choice: value as string | null }));
        break;
    }
  }
  reset() {
    this.fields().reset(this.initial);
  }
}
