import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { switchMap, tap, throwError, timer } from 'rxjs';
import { IZvActionButton, ZvActionButtonComponent } from './action-button.component';
import { ZvActionButtonHarness } from './action-button.harness';
import { ZvActionDataSource } from './action-data-source';

@Component({
  selector: 'zv-test-component',
  template: `<zv-action-button [actionDs]="dataSource" [button]="actionButton" />`,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ZvActionButtonComponent],
})
export class TestComponent {
  public readonly isDisabled = signal<boolean>(false);
  public actionFnCalled = false;
  dataSource = new ZvActionDataSource({
    actionFn: () => timer(1).pipe(tap(() => (this.actionFnCalled = true))),
  });

  actionButton: IZvActionButton = {
    label: `label`,
    color: 'primary',
    icon: 'home',
    dataCy: 'dataCyTest',
    isDisabled: this.isDisabled,
  };
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

  it('should be blocked while pending', async () => {
    component.dataSource.execute();
    expect(component.dataSource.pending()).toBeTrue();
    expect(await harness.isBlocked()).toBeTrue();
  });

  it('should be disabled while pending', async () => {
    component.dataSource.execute();
    expect(component.dataSource.pending()).toBeTrue();
    expect(await harness.isDisabled()).toBeTrue();
  });

  it('should respect disabled property', async () => {
    expect(await harness?.isDisabled()).toBeFalse();
    component.isDisabled.set(true);
    expect(await harness?.isDisabled()).toBeTrue();
    component.isDisabled.set(false);
    expect(await harness?.isDisabled()).toBeFalse();
  });

  it('should respect color property', async () => {
    expect(await harness.hasClass('mat-primary')).toBeTrue();
    component.actionButton = { ...component.actionButton, color: 'accent' };
    expect(await harness.hasClass('mat-accent')).toBeTrue();
    component.actionButton = { ...component.actionButton, color: 'warn' };
    expect(await harness.hasClass('mat-warn')).toBeTrue();
  });

  it('should have dataCy attribute', async () => {
    expect(await harness.getDataCy()).toBe('dataCyTest');
  });

  it('should show icon', async () => {
    expect(await harness.getButtonIcon()).toBe('home');
  });

  it('should show label', async () => {
    const buttonContent = await harness.getButtonContent();
    expect(buttonContent).toContain('label');
  });

  it('should show success icon', fakeAsync(async () => {
    await harness.click();
    tick(1);
    expect(component.dataSource.pending()).toBeFalse();
    expect(component.dataSource.succeeded()).toBeTrue();
    expect(await harness.showsSuccess()).toBeTrue();
  }));

  it('should show error message', fakeAsync(async () => {
    const error = new Error('action failed');
    component.dataSource = new ZvActionDataSource({ actionFn: () => timer(1).pipe(switchMap(() => throwError(() => error))) });
    await harness.click();
    tick(1);
    expect(await harness.showsSuccess()).toBeFalse();
    expect(await (await harness.getError())?.text()).toBe(error.message);
  }));
});
