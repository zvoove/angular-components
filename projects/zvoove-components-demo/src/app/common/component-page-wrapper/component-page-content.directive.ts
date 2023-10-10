import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appComponentPageContent]',
  standalone: true,
})
export class ComponentPageContentDirective {
  @Input({ required: true }) type: 'demo' | 'api' | 'setup' | 'other';
  @Input() label: string;
  constructor(public templateRef: TemplateRef<unknown>) {}
}
