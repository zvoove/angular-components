import { Directive, Input } from '@angular/core';

@Directive({
  selector: 'app-api-doc-method',
  standalone: true,
})
export class AppApiDocMethod {
  @Input({ required: true }) signature: string;
  @Input({ required: true }) returnType: string;
  @Input({ required: true }) desc: string;
}
