import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ZvSelectModule } from '@zvoove/components/select/src/select.module';
import { Observable, of } from 'rxjs';
import { bufferCount, startWith } from 'rxjs/operators';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-select-with-error-state-matcher',
  templateUrl: './select-with-error-state-matcher.component.html',
  styleUrls: ['./select-with-error-state-matcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, ReactiveFormsModule, MatFormFieldModule, ZvSelectModule, AsyncPipe, JsonPipe],
})
export class SelectWithErrorStateMatcherComponent {
  public items$: Observable<any[]> = of(
    Array.from(Array(10).keys()).map((i) => ({
      value: `id${i}`,
      label: `Item ${i}`,
    }))
  );
  public form = new FormGroup({
    select: new FormControl(null, [Validators.required]),
  });
  public errorStateMatcher = new MyErrorStateMatcher();
  public lastFiveValues$ = this.form.get('select').valueChanges.pipe(startWith(null, null, null, null, null as any), bufferCount(5, 1));

  constructor() {
    this.form.disable();
  }

  toggleDiabled() {
    if (this.form.disabled) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }
}
