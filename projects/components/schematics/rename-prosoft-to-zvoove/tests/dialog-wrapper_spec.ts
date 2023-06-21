import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const htmlContent = `
<ps-dialog-wrapper [dataSource]="dataSource">
  <div style="margin: 1em;">
    <div>Action function called: {{ actionFunctionCalled }}</div>
    <button type="button" mat-button (click)="toggleError()">Create error</button>
    <button type="button" mat-stroked-button (click)="block()">Block for 2 seconds</button>
  </div>
</ps-dialog-wrapper>
`;

const htmlModifiedContent = `
<zv-dialog-wrapper [dataSource]="dataSource">
  <div style="margin: 1em;">
    <div>Action function called: {{ actionFunctionCalled }}</div>
    <button type="button" mat-button (click)="toggleError()">Create error</button>
    <button type="button" mat-stroked-button (click)="block()">Block for 2 seconds</button>
  </div>
</zv-dialog-wrapper>
`;

const tsContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PsDialogWrapperModule } from '@prosoft/components/dialog-wrapper';
import { DialogWrapperDemoComponent, DialogWrapperDemoDialog } from './dialog-wrapper-demo.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DialogWrapperDemoComponent,
      },
    ]),
    MatButtonModule,
    PsDialogWrapperModule,
  ],
  declarations: [DialogWrapperDemoComponent, DialogWrapperDemoDialog],
})
export class DialogWrapperDemoModule {}

import { IPsButton, IPsException } from '@prosoft/components/core';
import { IPsDialogWrapperDataSource } from '@prosoft/components/dialog-wrapper';

export class DemoDialogWrapperDataSource implements IPsDialogWrapperDataSource {
  dialogTitle = this.options.dialogTitle;
  buttons: IPsButton[] = [
    {
      label: 'Ok',
      type: 'raised',
      color: 'primary',
      disabled: () => false,
      click: () => this.confirm(),
    },
    {
      label: 'Cancel',
      type: 'stroked',
      color: null,
      disabled: () => false,
      click: () => this.close(),
    },
  ];
  contentVisible = true;
  contentBlocked = false;
  exception: IPsException;

  public somethingChanged$ = new Subject<void>();

  constructor(private options: IDemoDialogWrapperDataSourceOptions) {}

  connect(): Observable<void> {
    return this.somethingChanged$;
  }

  disconnect(): void {}

  confirm() {
    return this.options.actionFn();
  }

  close() {
    this.options.cancelFn();
  }
}

public toggleError() {
  if (!this.dataSource.exception) {
    this.dataSource.exception = {
      errorObject: { message: 'I am an evil error' },
    } as IPsException;
  } else {
    this.dataSource.exception = null;
  }

  this.dataSource.somethingChanged$.next();
}
`;

const tsModifiedContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ZvDialogWrapperModule } from '@zvoove/components/dialog-wrapper';
import { DialogWrapperDemoComponent, DialogWrapperDemoDialog } from './dialog-wrapper-demo.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DialogWrapperDemoComponent,
      },
    ]),
    MatButtonModule,
    ZvDialogWrapperModule,
  ],
  declarations: [DialogWrapperDemoComponent, DialogWrapperDemoDialog],
})
export class DialogWrapperDemoModule {}

import { IZvButton, IZvException } from '@zvoove/components/core';
import { IZvDialogWrapperDataSource } from '@zvoove/components/dialog-wrapper';

export class DemoDialogWrapperDataSource implements IZvDialogWrapperDataSource {
  dialogTitle = this.options.dialogTitle;
  buttons: IZvButton[] = [
    {
      label: 'Ok',
      type: 'raised',
      color: 'primary',
      disabled: () => false,
      click: () => this.confirm(),
    },
    {
      label: 'Cancel',
      type: 'stroked',
      color: null,
      disabled: () => false,
      click: () => this.close(),
    },
  ];
  contentVisible = true;
  contentBlocked = false;
  exception: IZvException;

  public somethingChanged$ = new Subject<void>();

  constructor(private options: IDemoDialogWrapperDataSourceOptions) {}

  connect(): Observable<void> {
    return this.somethingChanged$;
  }

  disconnect(): void {}

  confirm() {
    return this.options.actionFn();
  }

  close() {
    this.options.cancelFn();
  }
}

public toggleError() {
  if (!this.dataSource.exception) {
    this.dataSource.exception = {
      errorObject: { message: 'I am an evil error' },
    } as IZvException;
  } else {
    this.dataSource.exception = null;
  }

  this.dataSource.somethingChanged$.next();
}
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
