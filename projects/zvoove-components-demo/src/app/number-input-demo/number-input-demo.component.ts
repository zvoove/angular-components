import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ZvFormService } from '@zvoove/components/form-base';
import { ZvFormField } from '@zvoove/components/form-field';
import { ZvNumberInput } from '@zvoove/components/number-input';
import { DemoZvFormsService } from '../common/demo-zv-form-service';

@Component({
  selector: 'app-number-input-demo',
  templateUrl: './number-input-demo.component.html',
  styleUrls: ['./number-input-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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

  public setValues(value: number) {
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
