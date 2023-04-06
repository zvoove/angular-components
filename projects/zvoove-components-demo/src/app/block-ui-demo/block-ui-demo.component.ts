import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-block-ui-demo',
  templateUrl: './block-ui-demo.component.html',
  styleUrls: ['./block-ui-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BlockUiDemoComponent {
  public blocked = true;
  public spinnerText = 'some custom text that will be displayed while the view is blocked';
}
