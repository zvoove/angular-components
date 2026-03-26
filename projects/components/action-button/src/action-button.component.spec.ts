import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { tap, timer } from 'rxjs';
import { ZvActionButtonDataSource } from './action-button-data-source';
import { ZvActionButtonComponent } from './action-button.component';
import { ZvActionButtonHarness } from './action-button.harness';
import { ZvButtonColors } from '@zvoove/components/core';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-action-button [dataSource]="dataSource" [color]="color()" [icon]="'home'" [disabled]="isDisabled()"> label </zv-action-button>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ZvActionButtonComponent],
})
export class TestComponent {
  public readonly isDisabled = signal<boolean>(false);
  public readonly color = signal<ZvButtonColors | null>('primary');
  public actionFnCalled = false;
  public throwError: Error | null = null;
  dataSource = new ZvActionButtonDataSource({
    actionFn: () =>
      timer(100).pipe(
        tap(() => {
          this.actionFnCalled = true;
          if (this.throwError) {
            throw this.throwError;
          }
        })
      ),
  });
}
describe('ZvActionButton', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let loader: HarnessLoader;
  let harness: ZvActionButtonHarness;

  beforeEach(async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    harness = await loader.getHarness(ZvActionButtonHarness);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should call dataSource.execute() on click', async () => {
    expect(component.actionFnCalled).toBe(false);
    await harness.click();
    await vi.advanceTimersByTimeAsync(100);
    expect(component.actionFnCalled).toBe(true);
  });

  it('should be blocked while loading', async () => {
    await harness.click();
    await vi.advanceTimersByTimeAsync(1);
    expect(component.dataSource.showLoading()).toBe(true);
    expect(await harness.isLoading()).toBe(true);
  });

  it('should be disabled while loading', async () => {
    await harness.click();
    await vi.advanceTimersByTimeAsync(1);
    expect(component.dataSource.showLoading()).toBe(true);
    expect(await harness.isDisabled()).toBe(true);
  });

  it('should respect disabled property', async () => {
    expect(await harness.isDisabled()).toBe(false);
    component.isDisabled.set(true);
    expect(await harness.isDisabled()).toBe(true);
    component.isDisabled.set(false);
    expect(await harness.isDisabled()).toBe(false);
  });

  it('should respect color property', async () => {
    expect(await harness.hasClass('mat-primary')).toBe(true);
    component.color.set('accent');
    expect(await harness.hasClass('mat-accent')).toBe(true);
    component.color.set('warn');
    expect(await harness.hasClass('mat-warn')).toBe(true);
  });

  it('should show icon', async () => {
    expect(await harness.getIcon()).toBe('home');
  });

  it('should show label', async () => {
    const buttonContent = await harness.getLabel();
    expect(buttonContent).toContain('label');
  });

  it('should show success icon for 2 seconds', async () => {
    await harness.click();
    await vi.advanceTimersByTimeAsync(100);
    expect(component.dataSource.showLoading()).toBe(false);
    expect(component.dataSource.showSuccess()).toBe(true);
    expect(await harness.getIcon()).toBe('check_circle');

    await vi.advanceTimersByTimeAsync(2000);
    expect(component.dataSource.showSuccess()).toBe(false);
    expect(await harness.getIcon()).toBe('home');
  });

  it('should show error message', async () => {
    component.throwError = new Error('action failed');
    await harness.click();
    await vi.advanceTimersByTimeAsync(100);
    expect(await harness.getIcon()).toBe('error');
    expect(await harness.getErrorMessage()).toBe(component.throwError.message);
  });
});
