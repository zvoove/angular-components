import { Directive, input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'app-api-doc-input',
  standalone: true,
})
export class AppApiDocInput {
  readonly name = input.required<string>();
  readonly type = input.required<string>();
  readonly typeUrl = input<string>();
  readonly desc = input.required<string>();
  readonly required = input(false);
  readonly twoWay = input(false);
}
