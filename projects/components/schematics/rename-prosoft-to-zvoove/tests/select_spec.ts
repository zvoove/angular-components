import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const htmlContent = `
<ps-select [(ngModel)]="ngModelValue" [dataSource]="items" [panelClass]="panelNgClass">
  <ng-container *psSelectTriggerTemplate="let item">
    color: <span [style.color]="item.value" class="asdf">{{ item.viewValue }}</span>
  </ng-container>
  <ng-container *psSelectOptionTemplate="let item">
    <div>color:</div>
    <span [style.color]="item.value.color" [style.font-size]="item.value.size" class="asdf">{{ item.label }}</span>
  </ng-container>
</ps-select>
`;

const htmlModifiedContent = `
<zv-select [(ngModel)]="ngModelValue" [dataSource]="items" [panelClass]="panelNgClass">
  <ng-container *zvSelectTriggerTemplate="let item">
    color: <span [style.color]="item.value" class="asdf">{{ item.viewValue }}</span>
  </ng-container>
  <ng-container *zvSelectOptionTemplate="let item">
    <div>color:</div>
    <span [style.color]="item.value.color" [style.font-size]="item.value.size" class="asdf">{{ item.label }}</span>
  </ng-container>
</zv-select>
`;

const tsContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule } from '@angular/router';
import { DefaultPsSelectService, PsSelectModule } from '@prosoft/components/select';

import { SelectWithCustomSelectServiceComponent } from './demos/select-with-custom-select-service.component';
import { SelectWithCustomTemplateComponent } from './demos/select-with-custom-template.component';
import { SelectWithEndlessLoadingDataSourceComponent } from './demos/select-with-endless-loading-datasource.component';
import { SelectWithErrorInDataSourceComponent } from './demos/select-with-error-in-datasource.component';
import { SelectWithErrorStateMatcherComponent } from './demos/select-with-error-state-matcher.component';
import { SelectWithEventsOnlyComponent } from './demos/select-with-events-only.component';
import { SelectWithMultiselectComponent } from './demos/select-with-multiselect.component';
import { SelectWithNgModelComponent } from './demos/select-with-ng-model.component';
import { SelectWithOtherLoadTriggerComponent } from './demos/select-with-other-load-trigger.component';
import { SelectWithSelectedItemNotInDataSourceComponent } from './demos/select-with-selected-item-not-in-datasource.component';
import { SelectDemoComponent } from './select-demo.component';

@NgModule({
  declarations: [
    SelectDemoComponent,
    SelectWithNgModelComponent,
    SelectWithEventsOnlyComponent,
    SelectWithSelectedItemNotInDataSourceComponent,
    SelectWithEndlessLoadingDataSourceComponent,
    SelectWithErrorInDataSourceComponent,
    SelectWithOtherLoadTriggerComponent,
    SelectWithMultiselectComponent,
    SelectWithCustomSelectServiceComponent,
    SelectWithCustomTemplateComponent,
    SelectWithErrorStateMatcherComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PsSelectModule.forRoot(DefaultPsSelectService),
    CommonModule,
    MatFormFieldModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatInputModule,
    RouterModule.forChild([
      {
        path: '',
        component: SelectDemoComponent,
      },
    ]),
  ],
  providers: [],
})
export class SelectDemoModule {}
`;

const tsModifiedContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule } from '@angular/router';
import { DefaultZvSelectService, ZvSelectModule } from '@zvoove/components/select';

import { SelectWithCustomSelectServiceComponent } from './demos/select-with-custom-select-service.component';
import { SelectWithCustomTemplateComponent } from './demos/select-with-custom-template.component';
import { SelectWithEndlessLoadingDataSourceComponent } from './demos/select-with-endless-loading-datasource.component';
import { SelectWithErrorInDataSourceComponent } from './demos/select-with-error-in-datasource.component';
import { SelectWithErrorStateMatcherComponent } from './demos/select-with-error-state-matcher.component';
import { SelectWithEventsOnlyComponent } from './demos/select-with-events-only.component';
import { SelectWithMultiselectComponent } from './demos/select-with-multiselect.component';
import { SelectWithNgModelComponent } from './demos/select-with-ng-model.component';
import { SelectWithOtherLoadTriggerComponent } from './demos/select-with-other-load-trigger.component';
import { SelectWithSelectedItemNotInDataSourceComponent } from './demos/select-with-selected-item-not-in-datasource.component';
import { SelectDemoComponent } from './select-demo.component';

@NgModule({
  declarations: [
    SelectDemoComponent,
    SelectWithNgModelComponent,
    SelectWithEventsOnlyComponent,
    SelectWithSelectedItemNotInDataSourceComponent,
    SelectWithEndlessLoadingDataSourceComponent,
    SelectWithErrorInDataSourceComponent,
    SelectWithOtherLoadTriggerComponent,
    SelectWithMultiselectComponent,
    SelectWithCustomSelectServiceComponent,
    SelectWithCustomTemplateComponent,
    SelectWithErrorStateMatcherComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ZvSelectModule.forRoot(DefaultZvSelectService),
    CommonModule,
    MatFormFieldModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatInputModule,
    RouterModule.forChild([
      {
        path: '',
        component: SelectDemoComponent,
      },
    ]),
  ],
  providers: [],
})
export class SelectDemoModule {}
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
