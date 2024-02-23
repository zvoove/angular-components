import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { allSharedImports } from '../common/shared-imports';

@Component({
  selector: 'app-upgrade-notes',
  templateUrl: './upgrade-notes.page.html',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [allSharedImports, RouterLink],
})
export class UpgrateNotesPage {}
