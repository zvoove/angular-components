import { ChangeDetectionStrategy, Component, OnChanges, ViewEncapsulation, inject, input } from '@angular/core';
import { IZvFormError, ZvFormService } from '@zvoove/components/form-base';
import { Observable } from 'rxjs';

import type { FormGroup } from '@angular/forms';
import { MatChipListbox, MatChip } from '@angular/material/chips';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'zv-form-errors',
  templateUrl: './form-errors.component.html',
  styleUrls: ['./form-errors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatChipListbox, MatChip, AsyncPipe],
})
export class ZvFormErrors implements OnChanges {
  private readonly formErrorsService = inject(ZvFormService);

  public readonly form = input.required<FormGroup>();
  public readonly includeControls = input(false);

  public errors$!: Observable<IZvFormError[]>;

  public ngOnChanges() {
    this.errors$ = this.formErrorsService.getFormErrors(this.form(), this.includeControls());
  }
}
