import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const htmlContent = `
<ps-form [dataSource]="dataSource">
  <mat-card>
    <form [formGroup]="form">
      <mat-form-field>
        <mat-label>Input 1</mat-label>
        <input type="text" matInput formControlName="input1" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Input 2</mat-label>
        <input type="text" matInput formControlName="input2" />
      </mat-form-field>
    </form>
  </mat-card>
  <mat-card style="height: 500px; margin-top: 1em;">dummy card</mat-card>
  <ng-container psFormSavebarButtons>
    <button mat-stroked-button type="button">dummy button 1</button>
    <button mat-stroked-button type="button">dummy button 2</button>
  </ng-container>
</ps-form>
`;

const htmlModifiedContent = `
<zv-form [dataSource]="dataSource">
  <mat-card>
    <form [formGroup]="form">
      <mat-form-field>
        <mat-label>Input 1</mat-label>
        <input type="text" matInput formControlName="input1" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Input 2</mat-label>
        <input type="text" matInput formControlName="input2" />
      </mat-form-field>
    </form>
  </mat-card>
  <mat-card style="height: 500px; margin-top: 1em;">dummy card</mat-card>
  <ng-container zvFormSavebarButtons>
    <button mat-stroked-button type="button">dummy button 1</button>
    <button mat-stroked-button type="button">dummy button 2</button>
  </ng-container>
</zv-form>
`;

const tsContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { PsFormModule } from '@prosoft/components/form';

import { DemoPsFormsService } from '../common/demo-ps-form-service';
import { FormDataSourceDemoComponent } from './form-data-source-demo.component';
import { FormDemoComponent } from './form-demo.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PsFormModule,
    RouterModule.forChild([
      {
        path: '',
        component: FormDemoComponent,
      },
    ]),
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule,
  ],
  declarations: [FormDemoComponent, FormDataSourceDemoComponent],
})
export class PsCardModule {}
@Component({
  selector: 'app-firma-create',
  template: \`
    <ps-form [dataSource]="fds">
      <ps-card [caption]="'global.FirmaHinzufuegen' | translate">
      </ps-card>
    </ps-form>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
`;

const tsModifiedContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ZvFormModule } from '@zvoove/components/form';

import { DemoPsFormsService } from '../common/demo-ps-form-service';
import { FormDataSourceDemoComponent } from './form-data-source-demo.component';
import { FormDemoComponent } from './form-demo.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ZvFormModule,
    RouterModule.forChild([
      {
        path: '',
        component: FormDemoComponent,
      },
    ]),
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule,
  ],
  declarations: [FormDemoComponent, FormDataSourceDemoComponent],
})
export class ZvCardModule {}
@Component({
  selector: 'app-firma-create',
  template: \`
    <zv-form [dataSource]="fds">
      <zv-card [caption]="'global.FirmaHinzufuegen' | translate">
      </zv-card>
    </zv-form>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
`;

describe('rename-prosoft-to-zvoove', () => {
  it('should rename the dom element and directives in html files', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../../migrations.json'));
    const tree = Tree.empty();
    tree.create('/app.component.html', htmlContent);
    tree.create('/multiple/sub/folders/test.component.html', htmlContent);
    const resultTree = await runner.runSchematicAsync('ng-add', {}, tree).toPromise();
    expect(resultTree.files).toEqual(['/app.component.html', '/multiple/sub/folders/test.component.html']);
    validateHtmlFile(resultTree.get('/app.component.html'), true);
    validateHtmlFile(resultTree.get('/multiple/sub/folders/test.component.html'), true);
  });

  it('should rename the imports in .ts files', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../../migrations.json'));
    const tree = Tree.empty();
    tree.create('/app.module.ts', tsContent);
    tree.create('/multiple/sub/folders/test.module.ts', tsContent);
    const resultTree = await runner.runSchematicAsync('ng-add', {}, tree).toPromise();
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
