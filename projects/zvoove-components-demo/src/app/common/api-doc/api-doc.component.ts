import { ChangeDetectionStrategy, Component, ViewEncapsulation, contentChildren, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AppApiDocInput } from './api-doc-input.component';
import { AppApiDocMethod } from './api-doc-method.component';
import { AppApiDocOutput } from './api-doc-output.component';
import { AppApiDocProperty } from './api-doc-property.component';

@Component({
  selector: 'app-api-doc',
  imports: [MatCardModule],
  templateUrl: './api-doc.component.html',
  styleUrls: ['./api-doc.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppApiDoc {
  name = input.required<string>();
  inputs = contentChildren(AppApiDocInput);
  outputs = contentChildren(AppApiDocOutput);
  properties = contentChildren(AppApiDocProperty);
  methods = contentChildren(AppApiDocMethod);
}
