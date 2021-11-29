import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const tsContent = `
  import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
  import { PsSelectLoadTrigger, PsSelectSortBy } from '@prosoft/components/select';

  @Component({
    selector: 'app-some-component',
    templateUrl: './some-template.html',
    styles: ['./some-styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
  })
  export class SomeComponent {
    public loadTriggerInitial = PsSelectLoadTrigger.Initial;
    public loadTriggerFirstPanelOpen = PsSelectLoadTrigger.FirstPanelOpen;
    public loadTriggerEveryPanelOpen = PsSelectLoadTrigger.EveryPanelOpen;
    public loadTriggerAll = PsSelectLoadTrigger.All;

    public noSort = PsSelectSortBy.None;
    public sortBySelected = PsSelectSortBy.Selected;
    public sortByComparer = PsSelectSortBy.Comparer;
    public sortByBoth = PsSelectSortBy.Both;

    constructor() {}
  }
`;

const tsModifiedContent = `
  import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
  import { PsSelectLoadTrigger, PsSelectSortBy } from '@prosoft/components/select';

  @Component({
    selector: 'app-some-component',
    templateUrl: './some-template.html',
    styles: ['./some-styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
  })
  export class SomeComponent {
    public loadTriggerInitial = PsSelectLoadTrigger.initial;
    public loadTriggerFirstPanelOpen = PsSelectLoadTrigger.firstPanelOpen;
    public loadTriggerEveryPanelOpen = PsSelectLoadTrigger.everyPanelOpen;
    public loadTriggerAll = PsSelectLoadTrigger.all;

    public noSort = PsSelectSortBy.none;
    public sortBySelected = PsSelectSortBy.selected;
    public sortByComparer = PsSelectSortBy.comparer;
    public sortByBoth = PsSelectSortBy.both;

    constructor() {}
  }
`;

describe('ps-select-load-trigger-and-sort-by-rename', () => {
  it('should work with empty tree', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    const tree = await runner.runSchematicAsync('ps-select-load-trigger-and-sort-by-rename', {}, Tree.empty()).toPromise();
    expect(tree.files).toEqual([]);
  });

  it('should rename LoadTrigger and SortBy enum values from PascalCase to camelCase for paths not blacklisted', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    const tree = Tree.empty();
    tree.create('/app.component.ts', tsContent);
    tree.create('/multiple/sub/folders/test.component.ts', tsContent);
    const resultTree = await runner.runSchematicAsync('ps-select-load-trigger-and-sort-by-rename', {}, tree).toPromise();
    expect(resultTree.files).toEqual(['/app.component.ts', '/multiple/sub/folders/test.component.ts']);
    validateFile(resultTree.get('/app.component.html'), true);
    validateFile(resultTree.get('/multiple/sub/folders/test.component.html'), true);
  });

  it('should skip non .ts files', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    const tree = Tree.empty();
    tree.create('/html.component.html', tsContent);
    tree.create('/json.component.json', tsContent);
    tree.create('/scss.component.scss', tsContent);
    const resultTree = await runner.runSchematicAsync('ps-select-load-trigger-and-sort-by-rename', {}, tree).toPromise();
    expect(resultTree.files).toEqual(['/html.component.html', '/json.component.json', '/scss.component.scss']);
    validateFile(resultTree.get('/html.component.html'), false);
    validateFile(resultTree.get('/json.component.json'), false);
    validateFile(resultTree.get('/scss.component.scss'), false);
  });

  it('should skip dist, angular and node_modules folders', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    const tree = Tree.empty();
    tree.create('/dist/dist.component.ts', tsContent);
    tree.create('/.angular/angular.component.ts', tsContent);
    tree.create('/some-folder/node_modules/node.component.ts', tsContent);
    const resultTree = await runner.runSchematicAsync('ps-select-load-trigger-and-sort-by-rename', {}, tree).toPromise();
    expect(resultTree.files).toEqual([
      '/dist/dist.component.ts',
      '/.angular/angular.component.ts',
      '/some-folder/node_modules/node.component.ts',
    ]);
    validateFile(resultTree.get('/dist/dist.component.ts'), false);
    validateFile(resultTree.get('/.angular/angular.component.ts'), false);
    validateFile(resultTree.get('/some-folder/node_modules/node.component.ts'), false);
  });

  function validateFile(file: FileEntry | null, changed: boolean) {
    expect(file).toBeDefined();
    if (file) {
      expect(file.content.toString()).toEqual(changed ? tsModifiedContent : tsContent);
    }
  }
});
