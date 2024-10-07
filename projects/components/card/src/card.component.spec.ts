import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { ZvHeaderHarness } from '@zvoove/components/header/src/testing/header.harness';
import { ZvCard } from './card.component';
import { ZvCardModule } from './card.module';
import { ZvCardHarness } from './testing/card.harness';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-card [caption]="caption" [description]="description">
      <ng-container *zvCardCaptionSection>
        @if (addCaptionTemplate) {
          <h1>customCaption</h1>
        }
      </ng-container>
      <ng-container *zvCardDescriptionSection>
        @if (addDescriptionTemplate) {
          <span>customDescription</span>
        }
      </ng-container>
      <ng-container *zvCardTopButtonSection>
        @if (addTopButton) {
          <button mat-button>testTopButton</button>
        }
      </ng-container>
      <ng-container *zvCardFooterSection>
        @if (addFooterTemplate) {
          <span>testFooter</span>
        }
      </ng-container>
      <ng-container *zvCardActionsSection>
        @if (addCardActionButton) {
          <button mat-button>testActionButton</button>
        }
      </ng-container>
      <h2>Test content</h2>
    </zv-card>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [ZvCardModule],
})
export class TestDataSourceComponent {
  public caption: string;
  public description: string;
  public addTopButton = false;
  public addCardActionButton = false;
  public addCaptionTemplate = false;
  public addDescriptionTemplate = false;
  public addFooterTemplate = false;
  @ViewChild(ZvCard) headerComponent: ZvCard;
}

describe('ZvCard', () => {
  let fixture: ComponentFixture<TestDataSourceComponent>;
  let component: TestDataSourceComponent;
  let loader: HarnessLoader;
  let header: ZvHeaderHarness;
  let card: ZvCardHarness;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDataSourceComponent, MatButtonModule],
    });
    fixture = TestBed.createComponent(TestDataSourceComponent);
    component = fixture.componentInstance;

    loader = TestbedHarnessEnvironment.loader(fixture);
    card = await loader.getHarness(ZvCardHarness);
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
