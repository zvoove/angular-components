import { DirEntry, FileEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const touchedFiles: string[] = [];

export default function(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('"ps-table: replace [cardLayout] with [layout]" started...');
    traverseDirectory(tree.root, tree, context);
    if (touchedFiles.length) {
      context.logger.info(`Modified files: ${touchedFiles.join(', ')}`);
    } else {
      context.logger.info('No modifications required.');
    }
    context.logger.info('"ps-table: replace [cardLayout] with [layout]" finished');
    return tree;
  };
}

function traverseDirectory(directory: DirEntry, tree: Tree, _context: SchematicContext) {
  const dirPath = directory.path;
  if (dirPath.endsWith('/dist') || dirPath.endsWith('/node_modules')) {
    // Skip these directories
    return;
  }
  for (const subDir of directory.subdirs) {
    traverseDirectory(directory.dir(subDir), tree, _context);
  }

  for (const fileName of directory.subfiles.filter(subFile => subFile.endsWith('.html'))) {
    const file = directory.file(fileName);
    if (file) {
      updateTemplate(file, tree, _context);
    }
  }
}

function updateTemplate(file: FileEntry, tree: Tree, _context: SchematicContext) {
  const content = file.content.toString();
  if (content.indexOf('ps-table') === -1) {
    return;
  }
  // the includeLocations flag is very important so that .nodeLocation() works down the line
  const dom = new JSDOM(content, { includeNodeLocations: true });
  const elements: HTMLElement[] = Array.from(<HTMLCollectionOf<HTMLElement>>dom.window.document.getElementsByTagName('ps-table')).filter(
    (x: HTMLElement) => x.hasAttribute('[cardLayout]')
  );
  if (elements.length) {
    const recorder = tree.beginUpdate(file.path);
    for (const element of elements) {
      const startOffset = content.indexOf('[cardLayout]', dom.nodeLocation(element).startOffset);
      const isCardLayoutFalse = element.getAttribute('[cardLayout]') === 'false';
      let removeLength = isCardLayoutFalse ? 20 : 19;
      if (!isCardLayoutFalse) {
        const removeChars = [' ', '\r', '\n'];
        while (removeChars.includes(content.charAt(startOffset + removeLength))) {
          removeLength++;
        }
      }

      recorder.remove(startOffset, removeLength);
      if (isCardLayoutFalse) {
        recorder.insertRight(startOffset, `[layout]="'flat'"`);
      }
    }

    tree.commitUpdate(recorder);
    touchedFiles.push(file.path);
  }
}
