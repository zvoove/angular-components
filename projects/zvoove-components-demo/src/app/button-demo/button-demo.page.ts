import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ZvButton } from '@zvoove/components/button';
import { ZvButtonColors, ZvButtonTypes } from '@zvoove/components/core';
import { allSharedImports } from '../common/shared-imports';

@Component({
  selector: 'app-button-demo',
  templateUrl: './button-demo.page.html',
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: 1em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [allSharedImports, ZvButton, MatIconModule, MatCardModule, FormsModule, MatInputModule, MatSelectModule, MatCheckbox],
})
export class ButtonDemoPage {
  type: ZvButtonTypes | null = 'flat';
  color: ZvButtonColors | null = null;
  dataCy: string | null = null;
  disabled = false;
  icon = 'add';
  label = 'label';
  clickCount = signal(0);

  clicked() {
    this.clickCount.set(this.clickCount() + 1);
  }

  importsCode = `
import { ZvButton } from '@zvoove/components/button';

// ...
imports: [
  ZvButton,
],
  `;
}
