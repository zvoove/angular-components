import { Directive, Input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'app-api-doc-method',
  standalone: true,
})
export class AppApiDocMethod {
  @Input({ required: true }) signature: string;
  @Input({ required: true }) returnType: string;
  @Input({ required: true }) desc: string;
}
