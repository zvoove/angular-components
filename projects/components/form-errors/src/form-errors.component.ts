import { ChangeDetectionStrategy, Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { IZvFormError, ZvFormService } from '@zvoove/components/form-base';
import { Observable } from 'rxjs';

import type { FormGroup } from '@angular/forms';

@Component({
  selector: 'zv-form-errors',
  template: `
    <mat-chip-list class="zv-form-errors__container" *ngIf="errors$ | async as errors">
      <mat-chip class="zv-form-errors__item" *ngFor="let error of errors">{{ error.errorText }}</mat-chip>
    </mat-chip-list>
  `,
  styles: [
    `
      .zv-form-errors__container {
        font-size: 12px;
      }
      .mat-chip.zv-form-errors__item {
        background-color: var(--zv-error);
        color: var(--zv-error-contrast);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZvFormErrorsComponent implements OnChanges {
  @Input() public form!: FormGroup;
  @Input() public includeControls: boolean = null;

  public errors$!: Observable<IZvFormError[]>;

  constructor(private formErrorsService: ZvFormService) {}

  public ngOnChanges() {
    this.errors$ = this.formErrorsService.getFormErrors(this.form, this.includeControls);
  }
}
