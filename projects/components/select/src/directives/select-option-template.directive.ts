import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[zvSelectOptionTemplate]',
  standalone: true,
})
export class ZvSelectOptionTemplate {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
