import { Tree, FileEntry } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const htmlContent = `
<ps-card>
  <ng-container *psCardCaptionSection>
    <h1 style="background-color: cyan;">Card with actions</h1>
  </ng-container>
  <ng-container *psCardDescriptionSection>
    <span style="background-color: lightblue;">You can also set a custom description</span>
  </ng-container>
  <ng-container *psCardTopButtonSection>
    <button mat-mini-fab color="primary">
      <mat-icon>add</mat-icon>
    </button>
    <button style="margin-left: 1em;" mat-mini-fab color="accent">
      <mat-icon>edit</mat-icon>
    </button>
    <button style="margin-left: 1em;" mat-mini-fab color="warn">
      <mat-icon>clear</mat-icon>
    </button>
  </ng-container>
  <div>
    <h2>Content goes here</h2>
  </div>
  <ng-container *psCardActionsSection>
    <div style="text-align: right;">
      <button mat-button color="primary">Add</button>
      <button mat-stroked-button>Cancel</button>
    </div>
  </ng-container>
  <ng-container *psCardFooterSection> <strong>This is some footer: </strong>someValue </ng-container>
</ps-card>
`;

const htmlModifiedContent = `
<zv-card>
  <ng-container *zvCardCaptionSection>
    <h1 style="background-color: cyan;">Card with actions</h1>
  </ng-container>
  <ng-container *zvCardDescriptionSection>
    <span style="background-color: lightblue;">You can also set a custom description</span>
  </ng-container>
  <ng-container *zvCardTopButtonSection>
    <button mat-mini-fab color="primary">
      <mat-icon>add</mat-icon>
    </button>
    <button style="margin-left: 1em;" mat-mini-fab color="accent">
      <mat-icon>edit</mat-icon>
    </button>
    <button style="margin-left: 1em;" mat-mini-fab color="warn">
      <mat-icon>clear</mat-icon>
    </button>
  </ng-container>
  <div>
    <h2>Content goes here</h2>
  </div>
  <ng-container *zvCardActionsSection>
    <div style="text-align: right;">
      <button mat-button color="primary">Add</button>
      <button mat-stroked-button>Cancel</button>
    </div>
  </ng-container>
  <ng-container *zvCardFooterSection> <strong>This is some footer: </strong>someValue </ng-container>
</zv-card>
`;

const tsContent = `
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PsCardComponent } from './card.component';
import {
  PsCardActionsSectionDirective,
  PsCardCaptionSectionDirective,
  PsCardDescriptionSectionDirective,
  PsCardFooterSectionDirective,
  PsCardTopButtonSectionDirective,
} from './card.directives';

@NgModule({
  imports: [CommonModule, MatCardModule],
  exports: [
    PsCardComponent,
    PsCardTopButtonSectionDirective,
    PsCardFooterSectionDirective,
    PsCardCaptionSectionDirective,
    PsCardDescriptionSectionDirective,
    PsCardActionsSectionDirective,
  ],
  declarations: [
    PsCardComponent,
    PsCardTopButtonSectionDirective,
    PsCardFooterSectionDirective,
    PsCardCaptionSectionDirective,
    PsCardDescriptionSectionDirective,
    PsCardActionsSectionDirective,
  ],
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
import { MatCardModule } from '@angular/material/card';
import { ZvCardComponent } from './card.component';
import {
  ZvCardActionsSectionDirective,
  ZvCardCaptionSectionDirective,
  ZvCardDescriptionSectionDirective,
  ZvCardFooterSectionDirective,
  ZvCardTopButtonSectionDirective,
} from './card.directives';

@NgModule({
  imports: [CommonModule, MatCardModule],
  exports: [
    ZvCardComponent,
    ZvCardTopButtonSectionDirective,
    ZvCardFooterSectionDirective,
    ZvCardCaptionSectionDirective,
    ZvCardDescriptionSectionDirective,
    ZvCardActionsSectionDirective,
  ],
  declarations: [
    ZvCardComponent,
    ZvCardTopButtonSectionDirective,
    ZvCardFooterSectionDirective,
    ZvCardCaptionSectionDirective,
    ZvCardDescriptionSectionDirective,
    ZvCardActionsSectionDirective,
  ],
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
