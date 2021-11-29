import { DirEntry, FileEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

const touchedFiles: string[] = [];

export default (): Rule => (tree: Tree, context: SchematicContext) => {
  context.logger.info('"ps-select: rename LoadTrigger and SortBy enums from PascalCase to camelCase" started...');
  traverseDirectory(tree.root, tree, context);
  if (touchedFiles.length) {
    context.logger.info(`Modified files: ${touchedFiles.join(', ')}`);
  } else {
    context.logger.info('No modifications required.');
  }
  context.logger.info('"ps-select: rename LoadTrigger and SortBy enums from PascalCase to camelCase" finished');
  return tree;
};

function traverseDirectory(directory: DirEntry, tree: Tree, _context: SchematicContext) {
  const dirPath = directory.path;
  if (dirPath.endsWith('/dist') || dirPath.endsWith('/node_modules') || dirPath.endsWith('/.angular')) {
    // Skip these directories
    return;
  }
  for (const subDir of directory.subdirs) {
    traverseDirectory(directory.dir(subDir), tree, _context);
  }

  for (const fileName of directory.subfiles.filter((subFile) => subFile.endsWith('.ts'))) {
    const file = directory.file(fileName);
    if (file) {
      updateFile(file, tree, _context);
    }
  }
}

function updateFile(file: FileEntry, tree: Tree, _context: SchematicContext) {
  const content = file.content.toString();
  if (content.indexOf('PsSelectLoadTrigger') === -1 && content.indexOf('PsSelectSortBy') === -1) {
    return;
  }

  if (content.indexOf('PsSelectLoadTrigger') !== -1) {
    camelize(content, 'PsSelectLoadTrigger', 'Initial');
    camelize(content, 'PsSelectLoadTrigger', 'FirstPanelOpen');
    camelize(content, 'PsSelectLoadTrigger', 'EveryPanelOpen');
    camelize(content, 'PsSelectLoadTrigger', 'All');
  }

  if (content.indexOf('PsSelectSortBy') !== -1) {
    camelize(content, 'PsSelectSortBy', 'None');
    camelize(content, 'PsSelectSortBy', 'Selected');
    camelize(content, 'PsSelectSortBy', 'Comparer');
    camelize(content, 'PsSelectSortBy', 'Both');
  }

  tree.overwrite(file.path, content);
  touchedFiles.push(file.path);
}

function camelize(fileContent: string, enumName: string, pascalCaseValue: string) {
  fileContent.replace(`${enumName}.${pascalCaseValue}`, `${enumName}.${pascalCaseValue.toLowerCase()}`);
}
