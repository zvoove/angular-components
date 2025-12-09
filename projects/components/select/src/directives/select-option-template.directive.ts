import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[zvSelectOptionTemplate]',
  standalone: true,
})
export class ZvSelectOptionTemplate {
  public readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
