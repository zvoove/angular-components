import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[zvSelectTriggerTemplate]',
  standalone: true,
})
export class ZvSelectTriggerTemplate {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
