import { JsonPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, input } from '@angular/core';
import { AbstractControl, NgModel } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AppCodeFilesComponent, CodeFiles } from '../code-files/code-files.component';

@Component({
  selector: 'app-form-control-demo-card',
  templateUrl: './form-control-demo-card.component.html',
  styleUrls: ['./form-control-demo-card.component.scss'],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [KeyValuePipe, MatCardModule, MatIconModule, JsonPipe, AppCodeFilesComponent],
})
export class FormControlDemoCard {
  readonly type = input.required<'form' | 'model' | 'value'>();
  readonly control = input<AbstractControl>();
  readonly value = input<unknown>();
  readonly codeFiles = input.required<CodeFiles[]>();
  readonly additionalData = input<Record<string, string | number>>();

  readonly ngModel = contentChild(NgModel, { read: NgModel });

  get formControl() {
    return this.control() ?? this.ngModel()?.control;
  }

  getType(value: unknown) {
    if (value === null) {
      return 'null';
    }
    if (value === undefined) {
      return 'undefined';
    }
    if (typeof value === 'object') {
      return typeof value + ' ' + value.constructor.name;
    }
    return typeof value;
  }
}
