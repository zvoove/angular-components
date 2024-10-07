import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

@Injectable()
export class InvalidErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
