import { JsonPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, Input } from '@angular/core';
import { AbstractControl, NgModel } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-form-control-demo-card',
  templateUrl: './form-control-demo-card.component.html',
  styleUrls: ['./form-control-demo-card.component.scss'],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [NgIf, MatCardModule, MatIconModule, JsonPipe],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class FormControlDemoCard {
  @Input({ required: true }) type: 'form' | 'model' | 'value';
  @Input() control?: AbstractControl;
  @Input() value?: unknown;
  @Input({ required: true }) code: string;

  @ContentChild(NgModel, { read: NgModel }) ngModel: NgModel;

  get formControl() {
    return this.control ?? this.ngModel?.control;
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
