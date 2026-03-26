import { Directive, Input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'app-api-doc-output',
  standalone: true,
})
export class AppApiDocOutput {
  @Input({ required: true }) name: string;
  @Input({ required: true }) type: string;
  @Input() typeUrl: string;
  @Input({ required: true }) desc: string;
  @Input() twoWay = false;
}
