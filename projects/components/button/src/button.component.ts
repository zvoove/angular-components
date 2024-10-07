import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, input, OnDestroy, output, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ZvButtonColors, ZvButtonTypes } from '@zvoove/components/core';

/** Only use this component when you absolutely need to dynamically switch the type. Otherwise just use the material buttons directly */
@Component({
  selector: 'zv-button',
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatButtonModule, NgTemplateOutlet, MatIcon],
})
export class ZvButton implements OnDestroy {
  type = input<ZvButtonTypes>('default');
  color = input<ZvButtonColors | null>(null);
  icon = input<string | null>(null);
  dataCy = input<string | null>(null);
  disabled = input<boolean>(false);
  click = output();

  constructor(private elementRef: ElementRef) {
    this.elementRef.nativeElement.addEventListener('click', this.captureClick, true);
  }

  ngOnDestroy() {
    this.elementRef.nativeElement.removeEventListener('click', this.captureClick, true);
  }

  private captureClick = (event: PointerEvent) => {
    if (this.disabled()) {
      event.stopPropagation();
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
    return true;
  };
}
