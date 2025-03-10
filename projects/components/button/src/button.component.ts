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
  imports: [MatButtonModule, NgTemplateOutlet, MatIcon],
})
export class ZvButton implements OnDestroy {
  readonly type = input<ZvButtonTypes>('default');
  readonly color = input<ZvButtonColors | null | undefined>(null);
  readonly icon = input<string | null | undefined>(null);
  readonly dataCy = input<string | null | undefined>(null);
  readonly disabled = input<boolean>(false);
  // We want to call it like the dom-click event because catching a click event should work as expected for buttons as well
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly click = output();

  constructor(private elementRef: ElementRef<HTMLElement>) {
    this.elementRef.nativeElement.addEventListener('click', this.captureClick, true);
  }

  ngOnDestroy() {
    this.elementRef.nativeElement.removeEventListener('click', this.captureClick, true);
  }

  private captureClick = (event: MouseEvent) => {
    if (this.disabled()) {
      event.stopPropagation();
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
    return true;
  };
}
