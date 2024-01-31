import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ZvBlockUi } from './block-ui.component';
import { ZvBlockUiHarness } from './testing/block-ui.harness';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-block-ui [blocked]="blocked" [spinnerText]="spinnerText">
      <div id="content">test text</div>
    </zv-block-ui>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TestComponent {
  public blocked = false;
  public spinnerText: string = null;

  @ViewChild(ZvBlockUi, { static: true }) blockui: ZvBlockUi;

  constructor(public cd: ChangeDetectorRef) {}
}

describe('ZvBlockUi', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let loader: HarnessLoader;
  let blockui: ZvBlockUiHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, CommonModule, ZvBlockUi],
      declarations: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    blockui = await loader.getHarness(ZvBlockUiHarness);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should show ng-content', waitForAsync(() => {
    const contentDebugEl = fixture.debugElement.query(By.css('#content'));
    expect(contentDebugEl).not.toBe(null);
    expect(contentDebugEl.nativeElement.textContent).toBe('test text');
  }));

  it('should not display spinner when not blocked', async () => {
    component.blocked = false;

    expect(await blockui.isBlocked()).toBeFalse();
    expect(await blockui.getSpinnerText()).toBe(null);
    expect(await blockui.getSpinnerDiameter()).toBe(0);
    expect(await blockui.isClickthrough()).toBe(false);
  });

  it('should display spinner when blocked', async () => {
    component.blocked = true;

    expect(await blockui.isBlocked()).toBeTrue();
    expect(await blockui.getSpinnerText()).toBe(null);
    expect(await blockui.getSpinnerDiameter()).toBe(20);
    expect(await blockui.isClickthrough()).toBe(false);
  });

  it('should display spinner text when provided', async () => {
    component.blocked = true;
    component.spinnerText = 'spinner text';

    expect(await blockui.isBlocked()).toBeTrue();
    expect(await blockui.getSpinnerText()).toBe('spinner text');
    expect(await blockui.getSpinnerDiameter()).toBe(20);
    expect(await blockui.isClickthrough()).toBe(false);
  });
});
