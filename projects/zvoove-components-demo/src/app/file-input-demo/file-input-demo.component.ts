import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, disabled as signalDisabled, form, readonly as signalReadonly, required as signalRequired } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ZvFileInput } from '@zvoove/components/file-input';
import { ZvFormService } from '@zvoove/components/form-base';
import { ZvFormField } from '@zvoove/components/form-field';
import { CodeFiles } from '../common/code-files/code-files.component';
import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { FormControlDemoCard } from '../common/form-control-card/form-control-demo-card.component';

@Component({
  selector: 'app-file-input-demo',
  templateUrl: './file-input-demo.component.html',
  styleUrls: ['./file-input-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    FormControlDemoCard,
    MatCardModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    ZvFormField,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ZvFileInput,
  ],
  providers: [{ provide: ZvFormService, useClass: DemoZvFormsService }],
})
export class FileInputDemoComponent {
  public value: File | null = null;
  public model: File | null = null;
  public control = new FormControl<File | null>(null);
  public form = new FormGroup({
    control: this.control,
  });

  public id = '';
  public acceptStr = '*.*';
  public accept = ['*.*'];
  public placeholder = '';
  public required = false;
  public disabled = false;
  public readonly = false;
  public errorStateMatcher: ErrorStateMatcher = null;

  public validatorRequired = false;
  public useErrorStateMatcher = false;

  readonly signalSettings = signal({ required: false, disabled: false, readonly: false });
  readonly signalModel = signal({ file: null as File | null });
  readonly signalFields = form(this.signalModel, (path) => {
    signalRequired(path.file, { when: () => this.signalSettings().required, message: 'Select a file' });
    signalDisabled(path.file, { when: () => this.signalSettings().disabled });
    signalReadonly(path.file, { when: () => this.signalSettings().readonly });
  });
  readonly signalCodeFiles: CodeFiles[] = [
    {
      filename: 'app.component.html',
      code: `<zv-form-field>
  <mat-label>Attachment</mat-label>
  <zv-file-input [formField]="fields.file" [accept]="accept" [placeholder]="placeholder" />
</zv-form-field>`,
    },
    {
      filename: 'app.component.ts',
      code: `import { signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';

readonly model = signal({ file: null as File | null });
readonly fields = form(this.model, (path) => required(path.file));`,
    },
  ];

  public onAcceptChange() {
    this.accept = this.acceptStr.split(',').map((s) => s.trim());
  }

  public onValidatorChange() {
    const validators = [];
    if (this.validatorRequired) {
      validators.push(Validators.required);
    }
    this.control.setValidators(validators);
    this.syncSignalSettings();
  }

  public onUseErrorStateMatcherChange() {
    if (this.useErrorStateMatcher) {
      this.errorStateMatcher = {
        isErrorState: () => true,
      };
    } else {
      this.errorStateMatcher = null;
    }
  }

  public setValues(value: File | null) {
    this.value = value;
    this.model = value;
    this.control.patchValue(value);
    this.signalModel.update((model) => ({ ...model, file: value }));
  }

  public onDisabledChanged() {
    if (this.disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
    this.syncSignalSettings();
  }

  public syncSignalSettings() {
    this.signalSettings.set({
      required: this.required || this.validatorRequired,
      disabled: this.disabled,
      readonly: this.readonly,
    });
  }

  public getCodeSnippet(type: 'value' | 'ngmodel' | 'form') {
    const attributes = [];
    if (type === 'value') {
      attributes.push('[(value)]="value"');
    } else if (type === 'ngmodel') {
      attributes.push('[(ngModel)]="value"');
    } else {
      attributes.push('formControlName="control"');
    }
    if (this.id) {
      attributes.push(`[id]="${this.id}"`);
    }
    if (this.acceptStr) {
      attributes.push(`[accept]="${JSON.stringify(this.accept)}"`);
    }
    if (this.placeholder) {
      attributes.push(`[placeholder]="${this.placeholder}"`);
    }
    if (this.required) {
      attributes.push(`[required]="${this.required}"`);
    }
    if (this.disabled) {
      attributes.push(`[disabled]="${this.disabled}"`);
    }
    if (this.readonly) {
      attributes.push(`[readonly]="${this.readonly}"`);
    }
    if (this.errorStateMatcher) {
      attributes.push(`[errorStateMatcher]="${this.errorStateMatcher ? 'errorStateMatcher' : 'null'}"`);
    }
    return `<zv-file-input ${attributes.join(' ')}></zv-file-input>`;
  }
}
