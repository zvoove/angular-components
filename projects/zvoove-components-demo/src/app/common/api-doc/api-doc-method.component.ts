import { Directive, input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'app-api-doc-method',
  standalone: true,
})
export class AppApiDocMethod {
  readonly signature = input.required<string>();
  readonly returnType = input.required<string>();
  readonly desc = input.required<string>();
}
