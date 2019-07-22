import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Observable, of } from 'rxjs';
import { bufferCount, startWith } from 'rxjs/operators';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-select-with-error-state-matcher',
  template: `
    <h2>Disabled form with custom error state matcher</h2>
    <div>
      <button (click)="toggleDiabled()">toggle disabled</button>
    </div>
    <span [formGroup]="form">
      <mat-form-field style="display:inline-block">
        <mat-label>select</mat-label>
        <ps-select formControlName="select" [dataSource]="items$" [errorStateMatcher]="errorStateMatcher"></ps-select>
      </mat-form-field>
    </span>
    value: {{ form.value.select | json }}<br />
    last 5 values: {{ lastFiveValues$ | async }}
    <ul>
      <li>Should be disabled initially</li>
      <li>Should be invalid/red on enabling</li>
      <li>Should be valid/grey when disabling (without choosing value)</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWithErrorStateMatcherComponent {
  public items$: Observable<any[]> = of(
    Array.from(Array(10).keys()).map(i => ({
      value: `id${i}`,
      label: `Item ${i}`,
    }))
  );
  public form = new FormGroup({
    select: new FormControl(null, [Validators.required]),
  });
  public errorStateMatcher = new MyErrorStateMatcher();
  public lastFiveValues$ = this.form.get('select').valueChanges.pipe(
    startWith(null, null, null, null, null),
    bufferCount(5, 1)
  );

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
