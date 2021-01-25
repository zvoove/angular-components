import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-card-demo',
  templateUrl: './card-demo.component.html',
  styles: [
    `
      .app-card-demo__content-wrapper {
        height: 100px;
        line-height: 100px;
        text-align: center;
        background-color: #dfdfdfdf;
      }

      .app-card-demo__content {
        display: inline-block;
        vertical-align: middle;
        line-height: normal;
      }

      .app-card-demo__ps-card {
        margin-top: 3em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDemoComponent {}
