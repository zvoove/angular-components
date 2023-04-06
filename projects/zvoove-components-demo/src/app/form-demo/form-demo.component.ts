import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-form-demo',
  templateUrl: './form-demo.component.html',
  styleUrls: ['./form-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDemoComponent {
  public demoType = 'dataSource';
}
