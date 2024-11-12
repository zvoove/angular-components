import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZvFormService } from '@zvoove/components/form-base';
import { ZvFormErrors } from '@zvoove/components/form-errors';
import { DemoZvFormsService } from '../common/demo-zv-form-service';

@Component({
  selector: 'app-form-errors-demo',
  templateUrl: './form-errors-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule, ZvFormErrors],
  providers: [{ provide: ZvFormService, useClass: DemoZvFormsService }],
})
export class FormErrorsDemoComponent {
  public form = new FormGroup(
    {
      input1: new FormControl('a', [Validators.required, Validators.minLength(3), Validators.maxLength(5)]),
      input2: new FormControl('', [Validators.required]),
    },
    (form: AbstractControl) => (form.value.input1 !== form.value.input2 ? { equal: 'must be equal' } : null)
  );
}
