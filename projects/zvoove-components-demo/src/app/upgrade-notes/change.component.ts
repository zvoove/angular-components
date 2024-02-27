import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-change',
  template: ` <ng-content /> `,
  styles: `
    :host {
      display: list-item;
      list-style-position: inside;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Change {}
