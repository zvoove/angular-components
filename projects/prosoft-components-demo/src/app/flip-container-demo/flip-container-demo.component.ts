import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-flip-container-demo',
  templateUrl: './flip-container-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlipContainerDemoComponent {
  public counter = 0;
}
