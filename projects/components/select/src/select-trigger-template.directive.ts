import { TemplateRef, Directive } from '@angular/core';

@Directive({ selector: '[zvSelectTriggerTemplate]' })
export class ZvSelectTriggerTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}
