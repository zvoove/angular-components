import { Directive, TemplateRef, input, inject } from '@angular/core';

@Directive({
  selector: '[appComponentPageContent]',
  standalone: true,
})
export class ComponentPageContentDirective {
  public readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);

  readonly type = input.required<'demo' | 'api' | 'setup' | 'other'>();
  readonly label = input('');
}
