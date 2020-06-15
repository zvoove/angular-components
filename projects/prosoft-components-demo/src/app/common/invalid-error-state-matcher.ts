import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class InvalidErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null, _: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}
