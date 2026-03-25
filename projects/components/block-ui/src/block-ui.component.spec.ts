import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ZvBlockUi } from './block-ui.component';
import { ZvBlockUiHarness } from './testing/block-ui.harness';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-block-ui [blocked]="blocked()" [spinnerText]="spinnerText()">
      <div id="content">test text</div>
    </zv-block-ui>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ZvBlockUi],
})
export class TestComponent {
  public blocked = signal(false);
  public spinnerText = signal('');
}

describe('ZvBlockUi', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let loader: HarnessLoader;
  let blockui: ZvBlockUiHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    blockui = await loader.getHarness(ZvBlockUiHarness);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should show ng-content', async () => {
    const contentDebugEl = fixture.debugElement.query(By.css('#content'));
    expect(contentDebugEl).not.toBe(null);
    expect(contentDebugEl.nativeElement.textContent).toBe('test text');
  });

  it('should not display spinner when not blocked', async () => {
    component.blocked.set(false);
    fixture.detectChanges();

    expect(await blockui.isBlocked()).toBe(false);
    expect(await blockui.getSpinnerText()).toBe(null);
    expect(await blockui.getSpinnerDiameter()).toBe(0);
    expect(await blockui.isClickthrough()).toBe(false);
  });

  it('should display spinner when blocked', async () => {
    component.blocked.set(true);
    fixture.detectChanges();

    expect(await blockui.isBlocked()).toBe(true);
    expect(await blockui.getSpinnerText()).toBe(null);
    // In jsdom, rendered dimensions are always 0, so check the component's calculated diameter instead
    expect(fixture.debugElement.children[0].componentInstance.spinnerDiameter()).toBe(20);
    expect(await blockui.isClickthrough()).toBe(false);
  });

  it('should display spinner text when provided', async () => {
    component.blocked.set(true);
    component.spinnerText.set('spinner text');
    fixture.detectChanges();

    expect(await blockui.isBlocked()).toBe(true);
    expect(await blockui.getSpinnerText()).toBe('spinner text');
    expect(await blockui.isClickthrough()).toBe(false);
  });
});
