import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { PsFormErrorsService } from './form-errors.service';
import { PsFormError } from './models';

@Component({
  selector: 'ps-form-errors',
  template: `
    <mat-chip-list class="ps-form-errors__container" *ngIf="errors$ | async as errors">
      <mat-chip class="ps-form-errors__item" *ngFor="let error of errors">{{ error.errorText }}</mat-chip>
    </mat-chip-list>
  `,
  styles: [
    `
      .ps-form-errors__container {
        font-size: 12px;
      }
      .ps-form-errors__item {
        background-color: var(--ps-error);
        color: var(--ps-error-contrast);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsFormErrorsComponent implements OnChanges {
  @Input() public form!: FormGroup;
  @Input() public includeControls = true;

  public errors$!: Observable<PsFormError[]>;

  constructor(private formErrorsService: PsFormErrorsService) {}

  public ngOnChanges() {
    this.errors$ = this.formErrorsService.getErrors(this.form, this.includeControls);
  }
}
