/* eslint-disable @typescript-eslint/no-floating-promises */
import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const htmlContent = `
<ps-header style="margin-top: 3em; width: 50%;">
  <ng-container *psHeaderTopButtonSection>
    <button mat-raised-button>
      <mat-icon>add</mat-icon>
      Add
    </button>
  </ng-container>
  <ng-container *psHeaderCaptionSection>
    <span>Caption</span>
  </ng-container>
  <ng-container *psHeaderDescriptionSection>
    <span>Description</span>
  </ng-container>
</ps-header>
`;

const htmlModifiedContent = `
<zv-header style="margin-top: 3em; width: 50%;">
  <ng-container *zvHeaderTopButtonSection>
    <button mat-raised-button>
      <mat-icon>add</mat-icon>
      Add
    </button>
  </ng-container>
  <ng-container *zvHeaderCaptionSection>
    <span>Caption</span>
  </ng-container>
  <ng-container *zvHeaderDescriptionSection>
    <span>Description</span>
  </ng-container>
</zv-header>
`;

const tsContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { PsHeaderModule } from '@prosoft/components/header';
import { HeaderDemoComponent } from './header-demo.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: HeaderDemoComponent,
      },
    ]),
    PsHeaderModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
  ],
  declarations: [HeaderDemoComponent],
})
export class HeaderDemoModule {}
`;

const tsModifiedContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { ZvHeaderModule } from '@zvoove/components/header';
import { HeaderDemoComponent } from './header-demo.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: HeaderDemoComponent,
      },
    ]),
    ZvHeaderModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
  ],
  declarations: [HeaderDemoComponent],
})
export class HeaderDemoModule {}
`;

describe('rename-prosoft-to-zvoove', () => {
  it('should rename the dom element and directives in html files', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../../migrations.json'));
    const tree = Tree.empty();
    tree.create('/app.component.html', htmlContent);
    tree.create('/multiple/sub/folders/test.component.html', htmlContent);
    const resultTree = await runner.runSchematic('ng-add', {}, tree);
    expect(resultTree.files).toEqual(['/app.component.html', '/multiple/sub/folders/test.component.html']);
    validateHtmlFile(resultTree.get('/app.component.html'), true);
    validateHtmlFile(resultTree.get('/multiple/sub/folders/test.component.html'), true);
  });

  it('should rename the imports in .ts files', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../../migrations.json'));
    const tree = Tree.empty();
    tree.create('/app.module.ts', tsContent);
    tree.create('/multiple/sub/folders/test.module.ts', tsContent);
    const resultTree = await runner.runSchematic('ng-add', {}, tree);
    expect(resultTree.files).toEqual(['/app.module.ts', '/multiple/sub/folders/test.module.ts']);
    validateTsFile(resultTree.get('/app.module.ts'), true);
    validateTsFile(resultTree.get('/multiple/sub/folders/test.module.ts'), true);
  });

  function validateHtmlFile(file: FileEntry | null, changed: boolean) {
    expect(file).toBeDefined();
    if (file) {
      expect(file.content.toString()).toEqual(changed ? htmlModifiedContent : htmlContent);
    }
  }
  function validateTsFile(file: FileEntry | null, changed: boolean) {
    expect(file).toBeDefined();
    if (file) {
      expect(file.content.toString()).toEqual(changed ? tsModifiedContent : tsContent);
    }
  }
});
