import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AppCodeComponent } from '../code/code.component';

export interface CodeFiles {
  filename: string;
  code: string;
  language?: string;
}

@Component({
  selector: 'app-code-files',
  imports: [AppCodeComponent, MatTabsModule],
  templateUrl: './code-files.component.html',
  styleUrls: ['./code-files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AppCodeFilesComponent {
  readonly files = input.required<CodeFiles[]>();
  readonly filesAdjusted = computed(() =>
    this.files().map((file) => ({
      ...file,
      language: file.language ?? getLanguage(file.filename),
    }))
  );
}

function getLanguage(filename: string) {
  const parts = filename.split('.');
  const ext = parts[parts.length - 1];
  if (ext === 'ts') return 'typescript';
  return ext;
}
