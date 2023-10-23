import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, TrackByFunction, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AppCodeComponent } from '../code/code.component';

export interface CodeFiles {
  filename: string;
  code: string;
}

@Component({
  selector: 'app-code-files',
  standalone: true,
  imports: [CommonModule, AppCodeComponent, MatTabsModule],
  templateUrl: './code-files.component.html',
  styleUrls: ['./code-files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AppCodeFilesComponent {
  @Input({ required: true }) files: CodeFiles[];

  trackByIdx: TrackByFunction<CodeFiles> = (idx) => idx;
}
