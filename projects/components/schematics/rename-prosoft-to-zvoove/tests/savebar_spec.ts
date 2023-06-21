import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const htmlContent = `
<ps-savebar
  [form]="form"
  (save)="onButtonClick('save')"
  (saveAndClose)="onButtonClick('saveAndClose')"
  (cancel)="onButtonClick('cancel')"
>
  <mat-card>
    <form [formGroup]="form">
      <mat-form-field>
        <mat-label>Input 1</mat-label>
        <input type="text" matInput formControlName="input1" />
      </mat-form-field>
      <div style="height: 100vh;"></div>
      <mat-form-field>
        <mat-label>Input 2</mat-label>
        <input type="text" matInput formControlName="input2" />
      </mat-form-field>
    </form>
  </mat-card>
  <ng-container *psSavebarRightContent>
    <button mat-stroked-button type="button" (click)="onButtonClick('custom')">Custom Button</button>
  </ng-container>
</ps-savebar>
`;

const htmlModifiedContent = `
<zv-savebar
  [form]="form"
  (save)="onButtonClick('save')"
  (saveAndClose)="onButtonClick('saveAndClose')"
  (cancel)="onButtonClick('cancel')"
>
  <mat-card>
    <form [formGroup]="form">
      <mat-form-field>
        <mat-label>Input 1</mat-label>
        <input type="text" matInput formControlName="input1" />
      </mat-form-field>
      <div style="height: 100vh;"></div>
      <mat-form-field>
        <mat-label>Input 2</mat-label>
        <input type="text" matInput formControlName="input2" />
      </mat-form-field>
    </form>
  </mat-card>
  <ng-container *zvSavebarRightContent>
    <button mat-stroked-button type="button" (click)="onButtonClick('custom')">Custom Button</button>
  </ng-container>
</zv-savebar>
`;

const tsContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { PsFormBaseModule } from '@prosoft/components/form-base';

import { DemoPsFormsService } from '../common/demo-ps-form-service';
import { SavebarDemoComponent } from './savebar-demo.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PsFormBaseModule.forRoot(DemoPsFormsService),
    PsSavebarModule,
    RouterModule.forChild([
      {
        path: '',
        component: SavebarDemoComponent,
      },
    ]),
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
  ],
  declarations: [SavebarDemoComponent],
  providers: [],
})
export class SavebarDemoModule {}
`;

const tsModifiedContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { ZvFormBaseModule } from '@zvoove/components/form-base';

import { DemoPsFormsService } from '../common/demo-ps-form-service';
import { SavebarDemoComponent } from './savebar-demo.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ZvFormBaseModule.forRoot(DemoPsFormsService),
    ZvSavebarModule,
    RouterModule.forChild([
      {
        path: '',
        component: SavebarDemoComponent,
      },
    ]),
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
  ],
  declarations: [SavebarDemoComponent],
  providers: [],
})
export class SavebarDemoModule {}
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
