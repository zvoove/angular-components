import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ZvFlipContainerModule } from '@zvoove/components/flip-container';
import { ZvFormService } from '@zvoove/components/form-base';
import { ZvFormField } from '@zvoove/components/form-field';
import { DemoZvFormsService } from '../common/demo-zv-form-service';

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
  standalone: true,
  imports: [MatCheckboxModule, ReactiveFormsModule, FormsModule, ZvFlipContainerModule, ZvFormField, MatFormFieldModule, MatInputModule],
  providers: [{ provide: ZvFormService, useClass: DemoZvFormsService }],
})
export class FlipContainerDemoComponent {
  public counter = 0;
  public removeHiddenNodes = true;
}
