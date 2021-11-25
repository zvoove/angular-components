import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { PsHeaderHarness } from '@prosoft/components/header/src/testing/header.harness';
import { PsCardComponent } from './card.component';
import { PsCardModule } from './card.module';
import { PsCardHarness } from './testing/card.harness';

@Component({
  selector: 'ps-test-component',
  template: `
    <ps-card [caption]="caption" [description]="description">
      <ng-container *psCardCaptionSection>
        <h1 *ngIf="addCaptionTemplate">customCaption</h1>
      </ng-container>
      <ng-container *psCardDescriptionSection>
        <span *ngIf="addDescriptionTemplate">customDescription</span>
      </ng-container>
      <ng-container *psCardTopButtonSection>
        <button *ngIf="addTopButton" mat-button>testTopButton</button>
      </ng-container>
      <ng-container *psCardFooterSection>
        <span *ngIf="addFooterTemplate">testFooter</span>
      </ng-container>
      <ng-container *psCardActionsSection>
        <button *ngIf="addCardActionButton" mat-button>testActionButton</button>
      </ng-container>
      <h2>Test content</h2>
    </ps-card>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TestDataSourceComponent {
  public caption: string;
  public description: string;
  public addTopButton = false;
  public addCardActionButton = false;
  public addCaptionTemplate = false;
  public addDescriptionTemplate = false;
  public addFooterTemplate = false;
  @ViewChild(PsCardComponent) headerComponent: PsCardComponent;
}

describe('PsCardComponent', () => {
  let fixture: ComponentFixture<TestDataSourceComponent>;
  let component: TestDataSourceComponent;
  let loader: HarnessLoader;
  let header: PsHeaderHarness;
  let card: PsCardHarness;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PsCardModule, MatButtonModule],
      declarations: [TestDataSourceComponent],
    });
    fixture = TestBed.createComponent(TestDataSourceComponent);
    component = fixture.componentInstance;
    expect(component).toBeDefined();

    loader = TestbedHarnessEnvironment.loader(fixture);
    card = await loader.getHarness(PsCardHarness);
    header = await card.getHeader();
  });

  it('should show caption text', async () => {
    expect(await header.getCaptionText()).toBeFalsy();

    component.caption = 'foo';
    expect(await header.getCaptionText()).toBe('foo');
  });

  it('should show caption template', async () => {
    expect(await header.getCaptionText()).toBeFalsy();

    component.addCaptionTemplate = true;
    const nodes = await header.getCaptionTemplateNodes();
    expect(nodes.length).toEqual(1);

    const captionNode = nodes[0];
    expect(await captionNode.matchesSelector('h1')).toEqual(true);
    expect(await captionNode.text()).toEqual('customCaption');
  });

  it('should show caption text when input and template are set at the same time', async () => {
    expect(await header.getCaptionText()).toBeFalsy();
    component.caption = 'foo';
    expect(await header.getCaptionText()).toBeTruthy();

    component.addCaptionTemplate = true;
    expect(await header.getCaptionText()).toBeTruthy();
    const nodes = await header.getCaptionTemplateNodes();
    expect(nodes.length).toEqual(0);
  });

  it('should show description text', async () => {
    expect(await header.getDescriptionText()).toBeFalsy();

    component.description = 'bar';
    expect(await header.getDescriptionText()).toBe('bar');
  });

  it('should show description template', async () => {
    expect(await header.getDescriptionText()).toBeFalsy();

    component.addDescriptionTemplate = true;
    const nodes = await header.getDescriptionTemplateNodes();
    expect(nodes.length).toEqual(1);

    const descriptionNode = nodes[0];
    expect(await descriptionNode.matchesSelector('span')).toEqual(true);
    expect(await descriptionNode.text()).toEqual('customDescription');
  });

  it('should show description text when input and template are set at the same time', async () => {
    expect(await header.getDescriptionText()).toBeFalsy();
    component.description = 'foo';
    expect(await header.getDescriptionText()).toBeTruthy();

    component.addDescriptionTemplate = true;
    expect(await header.getDescriptionText()).toBeTruthy();
    const nodes = await header.getDescriptionTemplateNodes();
    expect(nodes.length).toEqual(0);
  });

  it('should show top buttons', async () => {
    let nodes = await header.getActionTemplateNodes();
    expect(nodes.length).toBe(0);

    component.addTopButton = true;
    nodes = await header.getActionTemplateNodes();
    expect(nodes.length).toBe(1);

    const buttonNodes = nodes[0];
    expect(await buttonNodes.matchesSelector('button')).toEqual(true);
    expect(await nodes[0].text()).toEqual('testTopButton');
  });

  it('should show action buttons', async () => {
    let nodes = await card.getActionTemplateNodes();
    expect(nodes.length).toBe(0);

    component.addCardActionButton = true;
    nodes = await card.getActionTemplateNodes();
    expect(nodes.length).toBe(1);
    expect(await nodes[0].text()).toEqual('testActionButton');
  });

  it('should show footer template', async () => {
    let nodes = await card.getFooterTemplateNodes();
    expect(nodes.length).toBe(0);

    component.addFooterTemplate = true;
    nodes = await card.getFooterTemplateNodes();
    expect(nodes.length).toBe(1);
    expect(await nodes[0].text()).toEqual('testFooter');
  });
});
