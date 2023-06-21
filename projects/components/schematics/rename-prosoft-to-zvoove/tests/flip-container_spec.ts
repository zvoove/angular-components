import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const htmlContent = `
<ps-flip-container #fade [animation]="'fade'" [removeHiddenNodes]="removeHiddenNodes" class="app-flip-container-demo__flip-container">
  <div *psFlipContainerFront class="app-flip-container-demo__page-content">
    Front
    <button (click)="counter = counter + 1" style="cursor: pointer;">increase count</button>
  </div>
  <div *psFlipContainerBack class="app-flip-container-demo__page-content">
    Back
  </div>
</ps-flip-container>
`;

const htmlModifiedContent = `
<zv-flip-container #fade [animation]="'fade'" [removeHiddenNodes]="removeHiddenNodes" class="app-flip-container-demo__flip-container">
  <div *zvFlipContainerFront class="app-flip-container-demo__page-content">
    Front
    <button (click)="counter = counter + 1" style="cursor: pointer;">increase count</button>
  </div>
  <div *zvFlipContainerBack class="app-flip-container-demo__page-content">
    Back
  </div>
</zv-flip-container>
`;

const tsContent = `
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { PsFlipContainerModule } from '@prosoft/components/flip-container';
import { DemoPsFormsService } from '../common/demo-ps-form-service';
import { FlipContainerDemoComponent } from './flip-container-demo.component';

@NgModule({
  declarations: [FlipContainerDemoComponent],
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatInputModule,
    PsFlipContainerModule,
    RouterModule.forChild([
      {
        path: '',
        component: FlipContainerDemoComponent,
      },
    ]),
  ],
  providers: [],
})
export class FlipContainerDemoModule {}
`;

const tsModifiedContent = `
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { ZvFlipContainerModule } from '@zvoove/components/flip-container';
import { DemoPsFormsService } from '../common/demo-ps-form-service';
import { FlipContainerDemoComponent } from './flip-container-demo.component';

@NgModule({
  declarations: [FlipContainerDemoComponent],
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatInputModule,
    ZvFlipContainerModule,
    RouterModule.forChild([
      {
        path: '',
        component: FlipContainerDemoComponent,
      },
    ]),
  ],
  providers: [],
})
export class FlipContainerDemoModule {}
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
