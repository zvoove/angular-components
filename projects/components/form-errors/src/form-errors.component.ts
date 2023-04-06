import { ChangeDetectionStrategy, Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { IZvFormError, ZvFormService } from '@zvoove/components/form-base';
import { Observable } from 'rxjs';

import type { FormGroup } from '@angular/forms';

@Component({
  selector: 'zv-form-errors',
  templateUrl: './form-errors.component.html',
  styleUrls: ['./form-errors.component.scss'],
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
