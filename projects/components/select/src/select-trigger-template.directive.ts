import { TemplateRef, Directive } from '@angular/core';

@Directive({ selector: '[psSelectTriggerTemplate]' })
export class PsSelectTriggerTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}
