import { Directive, input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'app-api-doc-output',
  standalone: true,
})
export class AppApiDocOutput {
  readonly name = input.required<string>();
  readonly type = input.required<string>();
  readonly typeUrl = input<string>();
  readonly desc = input.required<string>();
  readonly twoWay = input(false);
}
