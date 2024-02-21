import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ZvCardModule } from '@zvoove/components/card';

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

      .app-card-demo__zv-card {
        margin-top: 3em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ZvCardModule, MatButtonModule, MatIconModule],
})
export class CardDemoComponent {}
