import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { ZvHeaderComponent, ZvHeaderModule } from '..';
import { ZvHeaderHarness } from './testing/header.harness';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-header [caption]="caption" [description]="description">
      <ng-container *zvHeaderTopButtonSection>
        <button mat-button color="accent" *ngIf="addButtons">testButton</button>
      </ng-container>
      <ng-container *zvHeaderCaptionSection>
        <h1 style="background-color: cyan;" *ngIf="addCaptionTemplate">caption text</h1>
      </ng-container>
      <ng-container *zvHeaderDescriptionSection>
        <span style="background-color: lightblue;" *ngIf="addDescriptionTemplate">description text</span>
      </ng-container>
    </zv-header>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TestDataSourceComponent {
  public caption: string;
  public description: string;
  public addButtons = false;
  public addCaptionTemplate = false;
  public addDescriptionTemplate = false;
  @ViewChild(ZvHeaderComponent) headerComponent: ZvHeaderComponent;
}

describe('ZvHeaderComponent', () => {
  let fixture: ComponentFixture<TestDataSourceComponent>;
  let component: TestDataSourceComponent;
  let loader: HarnessLoader;
  let header: ZvHeaderHarness;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZvHeaderModule, MatButtonModule],
      declarations: [TestDataSourceComponent],
    });
    fixture = TestBed.createComponent(TestDataSourceComponent);
    component = fixture.componentInstance;

    loader = TestbedHarnessEnvironment.loader(fixture);
    header = await loader.getHarness(ZvHeaderHarness);
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
    expect(await captionNode.text()).toEqual('caption text');
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
    expect(await descriptionNode.text()).toEqual('description text');
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

  it('should show buttons', async () => {
    let btns = await header.getActionTemplateNodes();
    expect(btns.length).toBe(0);

    component.addButtons = true;
    btns = await header.getActionTemplateNodes();
    expect(btns.length).toBe(1);
    expect(await btns[0].text()).toEqual('testButton');
  });
});
