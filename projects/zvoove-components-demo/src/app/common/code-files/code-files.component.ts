import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AppCodeComponent } from '../code/code.component';

export interface CodeFiles {
  filename: string;
  code: string;
}

@Component({
  selector: 'app-code-files',
  standalone: true,
  imports: [AppCodeComponent, MatTabsModule],
  templateUrl: './code-files.component.html',
  styleUrls: ['./code-files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AppCodeFilesComponent {
  @Input({ required: true }) files: CodeFiles[];
}
