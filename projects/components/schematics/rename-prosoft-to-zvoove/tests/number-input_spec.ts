import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const htmlContent = `
<ps-form-field [hint]="'Value: ' + value">
  <mat-label>value</mat-label>
  <ps-number-input
    [min]="min"
    [max]="max"
    [stepSize]="stepSize"
    [decimals]="decimals"
    [placeholder]="placeholder"
    [required]="required"
    [disabled]="disabled"
    [readonly]="readonly"
    [errorStateMatcher]="errorStateMatcher"
    [(value)]="value"
  ></ps-number-input>
</ps-form-field>
`;

const htmlModifiedContent = `
<zv-form-field [hint]="'Value: ' + value">
  <mat-label>value</mat-label>
  <zv-number-input
    [min]="min"
    [max]="max"
    [stepSize]="stepSize"
    [decimals]="decimals"
    [placeholder]="placeholder"
    [required]="required"
    [disabled]="disabled"
    [readonly]="readonly"
    [errorStateMatcher]="errorStateMatcher"
    [(value)]="value"
  ></zv-number-input>
</zv-form-field>
`;

const tsContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { PsFormBaseModule } from '@prosoft/components/form-base';
import { PsFormFieldModule } from '@prosoft/components/form-field';
import { PsNumberInputModule } from '@prosoft/components/number-input';

import { DemoPsFormsService } from '../common/demo-ps-form-service';
import { InvalidErrorStateMatcher } from '../common/invalid-error-state-matcher';
import { NumberInputDemoComponent } from './number-input-demo.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: NumberInputDemoComponent,
      },
    ]),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    PsNumberInputModule,

    PsFormBaseModule.forRoot(DemoPsFormsService),
    PsFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
  ],
  declarations: [NumberInputDemoComponent],
  providers: [{ provide: ErrorStateMatcher, useClass: InvalidErrorStateMatcher }],
})
export class NumberInputDemoModule {}
`;

const tsModifiedContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { ZvFormBaseModule } from '@zvoove/components/form-base';
import { ZvFormFieldModule } from '@zvoove/components/form-field';
import { ZvNumberInputModule } from '@zvoove/components/number-input';

import { DemoPsFormsService } from '../common/demo-ps-form-service';
import { InvalidErrorStateMatcher } from '../common/invalid-error-state-matcher';
import { NumberInputDemoComponent } from './number-input-demo.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: NumberInputDemoComponent,
      },
    ]),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    ZvNumberInputModule,

    ZvFormBaseModule.forRoot(DemoPsFormsService),
    ZvFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
  ],
  declarations: [NumberInputDemoComponent],
  providers: [{ provide: ErrorStateMatcher, useClass: InvalidErrorStateMatcher }],
})
export class NumberInputDemoModule {}
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
