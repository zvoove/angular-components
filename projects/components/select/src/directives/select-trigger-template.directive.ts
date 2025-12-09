import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[zvSelectTriggerTemplate]',
  standalone: true,
})
export class ZvSelectTriggerTemplate {
  public readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
