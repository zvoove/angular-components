import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[zvFlipContainerFront]',
  standalone: true,
})
export class FlipContainerFront {
  public readonly el = inject(ElementRef);
}

@Directive({
  selector: '[zvFlipContainerBack]',
  standalone: true,
})
export class FlipContainerBack {
  public readonly el = inject(ElementRef);
}
