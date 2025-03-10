import { Directive, TemplateRef, input } from '@angular/core';

@Directive({
  selector: '[appComponentPageContent]',
  standalone: true,
})
export class ComponentPageContentDirective {
  readonly type = input.required<'demo' | 'api' | 'setup' | 'other'>();
  readonly label = input('');
  constructor(public templateRef: TemplateRef<unknown>) {}
}
