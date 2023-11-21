import { JsonPipe, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, Input, TrackByFunction } from '@angular/core';
import { AbstractControl, NgModel } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AppCodeFilesComponent, CodeFiles } from '../code-files/code-files.component';
import { AppCodeComponent } from '../code/code.component';

@Component({
  selector: 'app-form-control-demo-card',
  templateUrl: './form-control-demo-card.component.html',
  styleUrls: ['./form-control-demo-card.component.scss'],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [NgIf, NgFor, KeyValuePipe, MatCardModule, MatIconModule, JsonPipe, AppCodeComponent, AppCodeFilesComponent],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class FormControlDemoCard {
  @Input({ required: true }) type: 'form' | 'model' | 'value';
  @Input() control?: AbstractControl;
  @Input() value?: unknown;
  @Input({ required: true }) codeFiles: CodeFiles[];
  @Input() additionalData: Record<string, string | number>;

  @ContentChild(NgModel, { read: NgModel }) ngModel: NgModel;

  get formControl() {
    return this.control ?? this.ngModel?.control;
  }

  addDataTrackBy: TrackByFunction<Record<string, string | number>> = (_, item) => item.key;

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
