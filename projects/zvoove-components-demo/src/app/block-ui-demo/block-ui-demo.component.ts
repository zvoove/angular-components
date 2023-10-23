import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ZvBlockUiModule } from '../../../../components/block-ui/src/block-ui.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-block-ui-demo',
  templateUrl: './block-ui-demo.component.html',
  styleUrls: ['./block-ui-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ZvBlockUiModule,
    MatButtonModule,
    MatCardModule,
  ],
})
export class BlockUiDemoComponent {
  public blocked = true;
  public spinnerText = 'some custom text that will be displayed while the view is blocked';
}
