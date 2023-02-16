import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-errors-demo',
  templateUrl: './form-errors-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormErrorsDemoComponent {
  public form = new FormGroup(
    {
      input1: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(5)]),
      input2: new FormControl('', [Validators.required]),
    },
    (form: AbstractControl) => (form.value.input1 !== form.value.input2 ? { equal: 'must be equal' } : null)
  );
}
