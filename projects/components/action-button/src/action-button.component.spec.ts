import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
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
  changeDetection: ChangeDetectionStrategy.Default,
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
    TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    harness = await loader.getHarness(ZvActionButtonHarness);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should call dataSource.execute() on click', async () => {
    expect(component.actionFnCalled).toBeFalse();
    await harness.click();
    expect(component.actionFnCalled).toBeTrue();
  });

  it('should be blocked while loading', fakeAsync(async () => {
    await harness.click();
    tick(1);
    expect(component.dataSource.showLoading()).toBeTrue();
    expect(await harness.isLoading()).toBeTrue();
  }));

  it('should be disabled while loading', fakeAsync(async () => {
    await harness.click();
    tick(1);
    expect(component.dataSource.showLoading()).toBeTrue();
    expect(await harness.isDisabled()).toBeTrue();
  }));

  it('should respect disabled property', async () => {
    expect(await harness.isDisabled()).toBeFalse();
    component.isDisabled.set(true);
    expect(await harness.isDisabled()).toBeTrue();
    component.isDisabled.set(false);
    expect(await harness.isDisabled()).toBeFalse();
  });

  it('should respect color property', async () => {
    expect(await harness.hasClass('mat-primary')).toBeTrue();
    component.color.set('accent');
    expect(await harness.hasClass('mat-accent')).toBeTrue();
    component.color.set('warn');
    expect(await harness.hasClass('mat-warn')).toBeTrue();
  });

  it('should show icon', async () => {
    expect(await harness.getIcon()).toBe('home');
  });

  it('should show label', async () => {
    const buttonContent = await harness.getLabel();
    expect(buttonContent).toContain('label');
  });

  it('should show success icon for 2 seconds', fakeAsync(async () => {
    await harness.click();
    tick(100);
    expect(component.dataSource.showLoading()).toBeFalse();
    expect(component.dataSource.showSuccess()).toBeTrue();
    expect(await harness.getIcon()).toBe('check_circle');

    tick(2000);
    expect(component.dataSource.showSuccess()).toBeFalse();
    expect(await harness.getIcon()).toBe('home');
  }));

  it('should show error message', fakeAsync(async () => {
    component.throwError = new Error('action failed');
    await harness.click();
    tick(100);
    expect(await harness.getIcon()).toBe('error');
    expect(await harness.getErrorMessage()).toBe(component.throwError.message);
  }));
});
