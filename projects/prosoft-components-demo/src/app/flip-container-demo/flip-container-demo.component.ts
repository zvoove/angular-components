import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-flip-container-demo',
  templateUrl: './flip-container-demo.component.html',
  styles: [
    `
      .app-flip-container-demo__flip-container {
        display: block;
        max-width: 500px;
      }
      .app-flip-container-demo__page-content {
        padding: 1em;
        border: 3px solid black;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlipContainerDemoComponent {
  public counter = 0;
  public removeHiddenNodes = true;
}
