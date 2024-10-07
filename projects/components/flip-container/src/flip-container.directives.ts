import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[zvFlipContainerFront]',
  standalone: true,
})
export class FlipContainerFront {
  constructor(public el: ElementRef) {}
}

@Directive({
  selector: '[zvFlipContainerBack]',
  standalone: true,
})
export class FlipContainerBack {
  constructor(public el: ElementRef) {}
}
