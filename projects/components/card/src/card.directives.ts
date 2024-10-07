import { Directive } from '@angular/core';

@Directive({
  selector: '[zvCardTopButtonSection]',
  standalone: true,
})
export class ZvCardTopButtonSection {}

@Directive({
  selector: '[zvCardCaptionSection]',
  standalone: true,
})
export class ZvCardCaptionSection {}

@Directive({
  selector: '[zvCardDescriptionSection]',
  standalone: true,
})
export class ZvCardDescriptionSection {}

@Directive({
  selector: '[zvCardFooterSection]',
  standalone: true,
})
export class ZvCardFooterSection {}

@Directive({
  selector: '[zvCardActionsSection]',
  standalone: true,
})
export class ZvCardActionsSection {}
