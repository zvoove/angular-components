import { Directive } from '@angular/core';

@Directive({
  selector: '[zvHeaderTopButtonSection]',
  standalone: true,
})
export class ZvHeaderTopButtonSection {}

@Directive({
  selector: '[zvHeaderCaptionSection]',
  standalone: true,
})
export class ZvHeaderCaptionSection {}

@Directive({
  selector: '[zvHeaderDescriptionSection]',
  standalone: true,
})
export class ZvHeaderDescriptionSection {}
