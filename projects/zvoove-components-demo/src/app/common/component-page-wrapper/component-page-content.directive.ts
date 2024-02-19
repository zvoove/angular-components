import { Directive, TemplateRef, input } from '@angular/core';

@Directive({
  selector: '[appComponentPageContent]',
  standalone: true,
})
export class ComponentPageContentDirective {
  type = input.required<'demo' | 'api' | 'setup' | 'other'>();
  label = input('');
  constructor(public templateRef: TemplateRef<unknown>) {}
}
