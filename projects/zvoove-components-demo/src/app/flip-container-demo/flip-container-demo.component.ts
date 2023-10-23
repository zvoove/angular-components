import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ZvFormFieldModule } from '../../../../components/form-field/src/form-field.module';
import { ZvFlipContainerModule } from '../../../../components/flip-container/src/flip-container.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
  imports: [
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    ZvFlipContainerModule,
    ZvFormFieldModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class FlipContainerDemoComponent {
  public counter = 0;
  public removeHiddenNodes = true;
}
