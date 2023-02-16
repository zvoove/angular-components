import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[zvFlipContainerFront]',
})
export class FlipContainerFrontDirective {
  constructor(public el: ElementRef) {}
}

@Directive({
  selector: '[zvFlipContainerBack]',
})
export class FlipContainerBackDirective {
  constructor(public el: ElementRef) {}
}
