import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const testHtmlContent = `<ps-block-ui [blocked]="true"></ps-block-ui>`;
const testTsContent = `
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: DemoComponent,
      },
    ]),
  ],
  declarations: [DemoComponent],
  providers: [],
})
export class DemoModule {}
`;

describe('rename-prosoft-to-zvoove', () => {
  it('should work with empty tree', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../../migrations.json'));
    const tree = await runner.runSchematicAsync('ng-add', {}, Tree.empty()).toPromise();
    expect(tree.files).toEqual([]);
  });

  it('should skip dist and node_modules folders', async () => {
    const runner = new SchematicTestRunner('test', require.resolve('../../migrations.json'));
    const tree = Tree.empty();
    tree.create('/dist/dist.component.html', testHtmlContent);
    tree.create('/some-folder/node_modules/node.component.ts', testTsContent);
    const resultTree = await runner.runSchematicAsync('ng-add', {}, tree).toPromise();
    validateHtmlFile(resultTree.get('/dist/dist.component.html'));
    validateTsFile(resultTree.get('/some-folder/node_modules/node.component.ts'));
  });

  function validateHtmlFile(file: FileEntry | null) {
    expect(file).toBeDefined();
    if (file) {
      expect(file.content.toString()).toEqual(testHtmlContent);
    }
  }
  function validateTsFile(file: FileEntry | null) {
    expect(file).toBeDefined();
    if (file) {
      expect(file.content.toString()).toEqual(testTsContent);
    }
  }
});
