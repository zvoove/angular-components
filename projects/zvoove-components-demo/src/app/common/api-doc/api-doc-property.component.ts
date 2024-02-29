import { Directive, Input } from '@angular/core';

@Directive({
  selector: 'app-api-doc-property',
  standalone: true,
})
export class AppApiDocProperty {
  @Input({ required: true }) name: string;
  @Input({ required: true }) type: string;
  @Input() typeUrl: string;
  @Input({ required: true }) desc: string;
}
