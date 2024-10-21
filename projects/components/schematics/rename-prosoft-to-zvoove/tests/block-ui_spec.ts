/* eslint-disable @typescript-eslint/no-floating-promises */
import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const htmlContent = `
<ps-block-ui [blocked]="blocked" [spinnerText]="spinnerText" [clickthrough]="clickthrough"></ps-block-ui>
`;

const htmlModifiedContent = `
<zv-block-ui [blocked]="blocked" [spinnerText]="spinnerText" [clickthrough]="clickthrough"></zv-block-ui>
`;

const tsContent = `
import { PsBlockUiModule } from '@prosoft/components/block-ui';
import { RouterModule } from '@angular/router';
import { BlockUiDemoComponent } from './block-ui-demo.component';

@NgModule({
  imports: [
    PsBlockUiModule,
    RouterModule.forChild([
      {
        path: '',
        component: BlockUiDemoComponent,
      },
    ]),
  ],
  declarations: [BlockUiDemoComponent],
  providers: [],
})
export class BlockUiDemoModule {}
`;

const tsModifiedContent = `
import { ZvBlockUiModule } from '@zvoove/components/block-ui';
import { RouterModule } from '@angular/router';
import { BlockUiDemoComponent } from './block-ui-demo.component';

@NgModule({
  imports: [
    ZvBlockUiModule,
    RouterModule.forChild([
      {
        path: '',
        component: BlockUiDemoComponent,
      },
    ]),
  ],
  declarations: [BlockUiDemoComponent],
  providers: [],
})
export class BlockUiDemoModule {}
`;

describe('rename-prosoft-to-zvoove', () => {
  it('should rename the dom element in html files', async () => {
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
