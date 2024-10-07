import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ZvFileInputComponent } from '@zvoove/components/file-input';
import { ZvFormService } from '@zvoove/components/form-base';
import { ZvFormFieldModule } from '@zvoove/components/form-field';
import { DemoZvFormsService } from '../common/demo-zv-form-service';

@Component({
  selector: 'app-file-input-demo',
  templateUrl: './file-input-demo.component.html',
  styleUrls: ['./file-input-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatCardModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    ZvFormFieldModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ZvFileInputComponent,
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
  public get accept() {
    return this.acceptStr.split(',').map((s) => s.trim());
  }
  public placeholder = '';
  public required = false;
  public disabled = false;
  public readonly = false;
  public errorStateMatcher: ErrorStateMatcher = null;

  public validatorRequired = false;
  public useErrorStateMatcher = false;

  public onValidatorChange() {
    const validators = [];
    if (this.validatorRequired) {
      validators.push(Validators.required);
    }
    this.control.setValidators(validators);
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
  }

  public onDisabledChanged() {
    if (this.disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
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
