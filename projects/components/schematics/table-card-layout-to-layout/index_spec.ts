import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const htmlTableContent = `
  <ps-table [dataSource]="dataSource" [cardLayout]="true" [sortable]="false">
    <ps-table-column [header]="'A'" [property]="'a'"></ps-table-column>
  </ps-table>
  <ps-table
    [dataSource]="dataSource"
    [cardLayout]="true"
    [sortable]="false"
  >
    <ps-table-column [header]="'A'" [property]="'a'"></ps-table-column>
  </ps-table>
  <ps-table [dataSource]="dataSource" [cardLayout]="false" [sortable]="false">
    <ps-table-column [header]="'A'" [property]="'a'"></ps-table-column>
  </ps-table>
  <ps-table
    [dataSource]="dataSource"
    [cardLayout]="false"
    [sortable]="false"
  >
    <ps-table-column [header]="'A'" [property]="'a'"></ps-table-column>
  </ps-table>
  <ps-table [dataSource]="dataSource" [sortable]="false">
    <ps-table-column [header]="'A'" [property]="'a'"></ps-table-column>
  </ps-table>
`;

const htmlModifiedTableContent = `
  <ps-table [dataSource]="dataSource" [sortable]="false">
    <ps-table-column [header]="'A'" [property]="'a'"></ps-table-column>
  </ps-table>
  <ps-table
    [dataSource]="dataSource"
    [sortable]="false"
  >
    <ps-table-column [header]="'A'" [property]="'a'"></ps-table-column>
  </ps-table>
  <ps-table [dataSource]="dataSource" [layout]="'flat'" [sortable]="false">
    <ps-table-column [header]="'A'" [property]="'a'"></ps-table-column>
  </ps-table>
  <ps-table
    [dataSource]="dataSource"
    [layout]="'flat'"
    [sortable]="false"
  >
    <ps-table-column [header]="'A'" [property]="'a'"></ps-table-column>
  </ps-table>
  <ps-table [dataSource]="dataSource" [sortable]="false">
    <ps-table-column [header]="'A'" [property]="'a'"></ps-table-column>
  </ps-table>
`;

describe('table-card-layout-to-layout', () => {
  it('should work with empty tree', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    const tree = await runner.runSchematicAsync('table-card-layout-to-layout', {}, Tree.empty()).toPromise();
    expect(tree.files).toEqual([]);
  });

  it('should replace cardLayout attribute with layout attribute for paths not blacklisted', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    const tree = Tree.empty();
    tree.create('/app.component.html', htmlTableContent);
    tree.create('/multiple/sub/folders/test.component.html', htmlTableContent);
    const resultTree = await runner.runSchematicAsync('table-card-layout-to-layout', {}, tree).toPromise();
    expect(resultTree.files).toEqual(['/app.component.html', '/multiple/sub/folders/test.component.html']);
    validateFile(resultTree.get('/app.component.html'), true);
    validateFile(resultTree.get('/multiple/sub/folders/test.component.html'), true);
  });

  it('should skip dist and node_modules folders', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    const tree = Tree.empty();
    tree.create('/dist/dist.component.html', htmlTableContent);
    tree.create('/some-folder/node_modules/node.component.html', htmlTableContent);
    const resultTree = await runner.runSchematicAsync('table-card-layout-to-layout', {}, tree).toPromise();
    expect(resultTree.files).toEqual(['/dist/dist.component.html', '/some-folder/node_modules/node.component.html']);
    validateFile(resultTree.get('/dist/dist.component.html'), false);
    validateFile(resultTree.get('/some-folder/node_modules/node.component.html'), false);
  });

  function validateFile(file: FileEntry | null, changed: boolean) {
    expect(file).toBeDefined();
    if (file) {
      expect(file.content.toString()).toEqual(changed ? htmlModifiedTableContent : htmlTableContent);
    }
  }
});
