import { TemplateRef, Directive } from '@angular/core';

@Directive({ selector: '[psSelectOptionTemplate]' })
export class PsSelectOptionTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}
