import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

import { PsTableRowDetailDirective } from '../directives/table.directives';

@Component({
  selector: 'ps-table-row-detail',
  template: `
    <div
      class="ps-table-row-detail__container"
      [@detailExpand]="animationState"
      (@detailExpand.start)="rowDetailToggleStart()"
      (@detailExpand.done)="rowDetailToggleEnd()"
    >
      <!--
        ps-iframe autoheight funktioniert nur, wenn das iframe beim Initialisieren sichtbar ist.
        Deshalb sorgen wir hier mit ngIf dafür, das es erst beim Aufklappen initialisiert wird.
      -->
      <ng-container *ngIf="visible">
        <ng-template [ngTemplateOutlet]="rowDetail.template" [ngTemplateOutletContext]="{ $implicit: element }"> </ng-template>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .ps-table-row-detail__container {
        overflow: hidden;
      }
    `,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*', minHeight: '20px' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TableRowDetailComponent {
  @Input() public rowDetail: PsTableRowDetailDirective;
  @Input() public element: any;
  @Input() public show: boolean;

  public get animationState(): string {
    return this.show ? 'expanded' : 'collapsed';
  }

  /** Expanded Items, die sichtbar sind (wird beim Start der Aufklapp-Animation und am Ende der Zuklapp-Animation gesetzt) */
  public visible = false;

  public rowDetailToggleStart() {
    if (this.show) {
      this.visible = true;
    }
  }

  public rowDetailToggleEnd() {
    if (!this.show) {
      this.visible = false;
    }
  }
}
