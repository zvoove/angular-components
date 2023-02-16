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
  template: `
    <div #content class="zv-block-ui__content">
      <ng-content></ng-content>
    </div>
    <ng-container *ngIf="blocked">
      <div class="zv-block-ui__overlay">
        <div class="zv-block-ui__overlay-content">
          <div class="zv-block-ui__spinner-container">
            <mat-spinner class="zv-block-ui__spinner" [diameter]="spinnerDiameter"></mat-spinner>
          </div>
          <div *ngIf="spinnerText">{{ spinnerText }}</div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [
    `
      zv-block-ui {
        display: grid;
        position: relative;
      }

      .zv-block-ui__clickthrough {
        pointer-events: none;
      }

      .zv-block-ui__clickthrough > .zv-block-ui__content {
        pointer-events: auto;
      }

      .zv-block-ui__content {
        grid-column: 1;
        grid-row: 1;
      }

      .zv-block-ui__overlay {
        grid-column: 1;
        grid-row: 1;
        z-index: 2;
        background-color: rgba(244, 244, 244, 0.6);

        display: flex;
        justify-content: center;
        align-items: center;
      }

      .zv-block-ui__spinner-container {
        overflow: hidden;
      }

      .zv-block-ui__spinner {
        display: inline-block;
        margin: auto;
        color: var(--zv-primary);
        opacity: 1;
      }

      .zv-block-ui__overlay-content {
        text-align: center;

        position: sticky;
        top: 10%;
        bottom: 10%;
      }
    `,
  ],
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
