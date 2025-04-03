import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { switchMap, throwError, timer } from 'rxjs';
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
  dataSource = new ZvActionDataSource({
    actionFn: () => timer(1),
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

  it('should be blocked while pending', async () => {
    const button = await harness.getButton();
    button?.click();
    expect(component.dataSource.pending()).toBeTrue();
    expect(await harness.isBlocked()).toBeTrue();
  });

  it('should be disabled while pending', async () => {
    const button = await harness.getButton();
    button?.click();
    expect(component.dataSource.pending()).toBeTrue();
    expect(await button!.getProperty('disabled')).toBeTrue();
  });

  it('should respect disabled property', async () => {
    const button = await harness.getButton();
    expect(await button?.getProperty('disabled')).toBeFalse();
    component.isDisabled.set(true);
    expect(await button!.getProperty('disabled')).toBeTrue();
    component.isDisabled.set(false);
    expect(await button?.getProperty('disabled')).toBeFalse();
  });

  it('should respect color property', async () => {
    const button = await harness.getButton();
    expect(await button?.hasClass('mat-primary')).toBeTrue();
    component.actionButton.color = 'accent';
    component.actionButton = { ...component.actionButton, color: 'accent' };
    expect(await button?.hasClass('mat-accent')).toBeTrue();
    component.actionButton = { ...component.actionButton, color: 'warn' };
    expect(await button?.hasClass('mat-warn')).toBeTrue();
  });

  it('should have dataCy attribute', async () => {
    const button = await harness.getButton();
    expect(await button?.getAttribute('data-cy')).toBe('dataCyTest');
  });

  it('should show icon', async () => {
    const icon = await harness.getButtonIcon();
    expect(await icon?.text()).toBe('home');
  });

  it('should show label', async () => {
    const buttonContent = await harness.getButtonContent();
    expect(buttonContent).toContain('label');
  });

  it('should show success icon', fakeAsync(async () => {
    const button = await harness.getButton();
    button?.click();
    tick(1);
    expect(component.dataSource.pending()).toBeFalse();
    expect(component.dataSource.succeeded()).toBeTrue();
    expect(await harness.showsSuccess()).toBeTrue();
  }));

  it('should show error message', fakeAsync(async () => {
    const error = new Error('action failed');
    component.dataSource = new ZvActionDataSource({ actionFn: () => timer(1).pipe(switchMap(() => throwError(() => error))) });
    const button = await harness.getButton();
    button?.click();
    tick(1);
    expect(await harness.showsSuccess()).toBeFalse();
    expect(await (await harness.getError())?.text()).toBe(error.message);
  }));
});
