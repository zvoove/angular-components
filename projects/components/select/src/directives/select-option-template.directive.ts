import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[zvSelectOptionTemplate]' })
export class ZvSelectOptionTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}
