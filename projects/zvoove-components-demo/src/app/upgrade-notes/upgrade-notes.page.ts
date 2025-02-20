import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { allSharedImports } from '../common/shared-imports';
import { Change } from './change.component';
import { Version } from './version.component';

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
  imports: [allSharedImports, RouterLink, Version, Change],
})
export class UpgrateNotesPage {}
