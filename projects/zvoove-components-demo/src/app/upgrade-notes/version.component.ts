import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-version',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ version() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <ul>
          <ng-content select="app-change" />
        </ul>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    ul {
      padding-left: 1em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent],
})
export class Version {
  readonly version = input.required<string>();
}
