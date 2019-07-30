import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ps-block-ui',
  template: `
    <div #content class="ps-block-ui__content">
      <ng-content></ng-content>
    </div>
    <ng-container *ngIf="blocked">
      <div class="ps-block-ui__overlay">
        <div class="ps-block-ui__overlay-content">
          <mat-spinner class="ps-block-ui__spinner" [diameter]="spinnerDiameter"></mat-spinner>
          <div *ngIf="spinnerText">{{ spinnerText }}</div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [
    `
      ps-block-ui {
        display: grid;
        position: relative;
      }

      .ps-block-ui__content {
        grid-column: 1;
        grid-row: 1;
      }

      .ps-block-ui__overlay {
        grid-column: 1;
        grid-row: 1;
        z-index: 2;
        background-color: rgba(244, 244, 244, 0.6);
      }

      .ps-block-ui__spinner {
        color: var(--ps-primary);
        opacity: 1;
      }

      .ps-block-ui__overlay-content {
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: sticky;
        top: calc(50% - 100px);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsBlockUiComponent implements OnChanges {
  @Input() public blocked: boolean;
  @Input() public spinnerText: string;

  public spinnerDiameter = 100;

  @ViewChild('content', { static: true }) public contentNode: ElementRef<HTMLElement>;

  public ngOnChanges() {
    const nativeEl = this.contentNode.nativeElement;
    const minDimension = Math.min(nativeEl.offsetWidth, nativeEl.offsetHeight);
    const textSpace = this.spinnerText ? 20 : 0;
    this.spinnerDiameter = Math.max(Math.min(minDimension - textSpace, 100), 10);
  }
}
