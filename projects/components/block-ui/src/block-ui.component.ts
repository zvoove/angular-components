import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import type { ElementRef } from '@angular/core';

@Component({
  selector: 'zv-block-ui',
  templateUrl: './block-ui.component.html',
  styleUrls: ['./block-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZvBlockUiComponent implements OnChanges, AfterViewInit {
  @Input() public blocked: boolean;
  @Input() public spinnerText: string;
  @HostBinding('class.zv-block-ui__clickthrough')
  @Input()
  public clickthrough = false;

  public spinnerDiameter = 100;

  @ViewChild('content', { static: true }) public contentNode: ElementRef<HTMLElement>;

  public ngOnChanges() {
    if (this.blocked) {
      this.updateSpinner();
    }
  }

  public ngAfterViewInit() {
    this.updateSpinner();
  }

  private updateSpinner() {
    const nativeEl = this.contentNode.nativeElement;
    const minDimension = Math.min(nativeEl.offsetWidth, nativeEl.offsetHeight);
    const textSpace = this.spinnerText ? 20 : 0;
    this.spinnerDiameter = Math.max(Math.min(minDimension - textSpace, 100), 10);
  }
}
