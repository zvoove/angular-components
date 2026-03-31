import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ZvAvatar } from '@zvoove/components/avatar';
import { allSharedImports } from '../common/shared-imports';

@Component({
  selector: 'app-avatar-demo',
  templateUrl: './avatar-demo.page.html',
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
  imports: [allSharedImports, ZvAvatar, MatCardModule, FormsModule, MatInputModule, MatSelectModule],
})
export class AvatarDemoPage {
  type: 'initials' | 'avatar' | 'image' = 'avatar';
  size: 'small' | 'medium' | 'large' = 'medium';
  variant: 'round' | 'square' = 'round';
  initialsAmount: 1 | 2 = 1;
  name = 'John Doe';
  image = 'https://i.pravatar.cc/150?img=3';

  importsCode = `
import { ZvAvatar } from '@zvoove/components/avatar';

// ...
imports: [
  ZvAvatar,
],
  `;
}
