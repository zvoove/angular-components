import { Directive, Input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'app-api-doc-input',
  standalone: true,
})
export class AppApiDocInput {
  @Input({ required: true }) name: string;
  @Input({ required: true }) type: string;
  @Input() typeUrl: string;
  @Input({ required: true }) desc: string;
  @Input() required = false;
  @Input() twoWay = false;
}
