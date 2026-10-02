import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, disabled as signalDisabled, form, max, min, readonly as signalReadonly, required as signalRequired } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ZvFormService } from '@zvoove/components/form-base';
import { ZvFormField } from '@zvoove/components/form-field';
import { ZvNumberInput } from '@zvoove/components/number-input';
import { CodeFiles } from '../common/code-files/code-files.component';
import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { FormControlDemoCard } from '../common/form-control-card/form-control-demo-card.component';

@Component({
  selector: 'app-number-input-demo',
  templateUrl: './number-input-demo.component.html',
  styleUrls: ['./number-input-demo.component.scss'],
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
    ZvNumberInput,
  ],
  providers: [{ provide: ZvFormService, useClass: DemoZvFormsService }],
})
export class NumberInputDemoComponent {
  public value = 5;
  public model = 5;
  public control = new FormControl(5);
  public form = new FormGroup({
    control: this.control,
  });

  public min = 0;
  public max = 20;
  public stepSize = 1;
  public decimals = 1;
  public placeholder = '';
  public required = false;
  public disabled = false;
  public readonly = false;
  public errorStateMatcher: ErrorStateMatcher = null;

  public validatorRequired = false;
  public useErrorStateMatcher = false;

  readonly signalSettings = signal({ required: false, disabled: false, readonly: false, min: 0, max: 20 });
  readonly signalModel = signal({ number: null as number | null });
  readonly signalFields = form(this.signalModel, (path) => {
    signalRequired(path.number, { when: () => this.signalSettings().required, message: 'Choose a number' });
    min(path.number, () => this.signalSettings().min);
    max(path.number, () => this.signalSettings().max);
    signalDisabled(path.number, { when: () => this.signalSettings().disabled });
    signalReadonly(path.number, { when: () => this.signalSettings().readonly });
  });
  readonly signalCodeFiles: CodeFiles[] = [
    {
      filename: 'app.component.html',
      code: `<zv-form-field>
  <mat-label>Number</mat-label>
  <zv-number-input [formField]="fields.number" [stepSize]="stepSize" [decimals]="decimals" />
</zv-form-field>`,
    },
    {
      filename: 'app.component.ts',
      code: `import { signal } from '@angular/core';
import { FormField, form, max, min, required } from '@angular/forms/signals';

readonly model = signal({ number: null as number | null });
readonly fields = form(this.model, (path) => {
  required(path.number);
  min(path.number, 0);
  max(path.number, 20);
});`,
    },
  ];

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

  public setValues(value: number | null) {
    this.value = value;
    this.model = value;
    this.control.patchValue(value);
    this.signalModel.update((model) => ({ ...model, number: value }));
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
      min: this.min,
      max: this.max,
    });
  }

  public getCodeSnippet(type: 'value' | 'ngmodel' | 'form') {
    let valueBinding;
    if (type === 'value') {
      valueBinding = '[(value)]="value"';
    } else if (type === 'ngmodel') {
      valueBinding = '[(ngModel)]="value"';
    } else {
      valueBinding = 'formControlName="control"';
    }
    return `  <zv-number-input
    [min]="${this.min}" [max]="${this.max}" [stepSize]="${this.stepSize}" [decimals]="${this.decimals}"
    [placeholder]="${this.placeholder}" [required]="${this.required}"
    [disabled]="${this.disabled}" [readonly]="${this.readonly}" [errorStateMatcher]="${
      this.errorStateMatcher ? 'errorStateMatcher' : 'null'
    }"
    ${valueBinding}
  ></zv-number-input>`;
  }
}
