import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { apiDoc } from '../common/shared-imports';

@Component({
  selector: 'app-table-api-doc',
  templateUrl: './table-api-doc.component.html',
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: 1em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [apiDoc, MatCard, MatCardHeader, MatCardTitle, MatCardContent],
})
export class TableApiDocComponent {}
