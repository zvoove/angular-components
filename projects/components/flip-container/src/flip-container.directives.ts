import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[psFlipContainerFront]',
})
export class FlipContainerFrontDirective {
  constructor(public el: ElementRef) {}
}

@Directive({
  selector: '[psFlipContainerBack]',
})
export class FlipContainerBackDirective {
  constructor(public el: ElementRef) {}
}
