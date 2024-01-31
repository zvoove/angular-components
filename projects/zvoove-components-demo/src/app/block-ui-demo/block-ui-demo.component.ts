import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { allSharedImports } from '../common/shared-imports';

@Component({
  selector: 'app-block-ui-demo',
  templateUrl: './block-ui-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    allSharedImports,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ZvBlockUi,
    MatButtonModule,
    MatCardModule,
  ],
})
export class BlockUiDemoComponent {
  public blocked = true;
  public spinnerText = 'some custom text that will be displayed while the view is blocked';

  usageCode = `
<zv-block-ui [blocked]="true" [spinnerText]="'Your optional spinner text.'" [clickthrough]="true">
  <div>This template part will be blocked</div>
</zv-block-ui>
`;

  importsCode = `
import { ZvBlockUi } from '@zvoove/components/block-ui';

// ...
imports: [
  ZvBlockUi,
],
`;
}
