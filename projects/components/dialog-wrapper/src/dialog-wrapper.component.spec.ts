import { OverlayContainer } from '@angular/cdk/overlay';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IZvButton, IZvException } from '@zvoove/components/core';
import { Observable, of, Subject } from 'rxjs';
import { ZvDialogWrapper } from './dialog-wrapper.component';
import { IZvDialogWrapperDataSource } from './dialog-wrapper.models';
import { ZvDialogWrapperHarness } from './testing/dialog-wrapper.harness';

interface ITestDialogWrapperDataSourceOptions {
  dialogTitle: string;
  actionFn: () => Observable<unknown>;
  cancelFn: () => void;
}

export class TestDialogWrapperDataSource implements IZvDialogWrapperDataSource {
  dialogTitle: string;
  buttons: IZvButton[] = [
    {
      label: 'Ok',
      type: 'raised',
      color: 'primary',
      disabled: () => false,
      click: () => this.confirm(),
    },
    {
      label: 'Cancel',
      type: 'stroked',
      color: null,
      disabled: () => false,
      click: () => this.close(),
    },
  ];
  contentVisible: boolean;
  contentBlocked: boolean;
  exception: IZvException;
  progress: number | null = null;

  public somethingChanged$ = new Subject<void>();

  constructor(private options: ITestDialogWrapperDataSourceOptions) {
    this.dialogTitle = this.options.dialogTitle;
  }

  connect(): Observable<void> {
    return this.somethingChanged$;
  }

  disconnect(): void {}

  confirm() {
    return this.options.actionFn();
  }

  close() {
    this.options.cancelFn();
  }

  setProgress(p: number | null) {
    this.progress = p;
    this.somethingChanged$.next();
  }
}

@Component({
  selector: 'zv-dialog-wrapper-dialog',
  template: `
    <zv-dialog-wrapper [dataSource]="dataSource">
      <span>dialogContent</span>
    </zv-dialog-wrapper>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [ZvDialogWrapper],
})
export class ZvDialogWrapperTestDialog {
  dataSource = new TestDialogWrapperDataSource({
    dialogTitle: 'MyDialogTitle',
    actionFn: () => this.actionFunction(),
    cancelFn: () => this.cancelFunction(),
  });

  private _cancelFunctionCalled: number;

  constructor(public dialogRef: MatDialogRef<ZvDialogWrapperTestDialog>) {}

  public actionFunction() {
    return of();
  }

  public cancelFunction() {
    this._cancelFunctionCalled = this._cancelFunctionCalled + 1;
    this.dialogRef.close();
  }
}

@Component({
  selector: 'zv-dialog-wrapper-test',
  template: ``,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [ZvDialogWrapper],
})
export class ZvDialogWrapperTestComponent {
  constructor(public dialog: MatDialog) {}

  public openDialog() {
    return this.dialog.open(ZvDialogWrapperTestDialog);
  }
}

describe('DialogUnitTestComponent', () => {
  let component: ZvDialogWrapperTestComponent;
  let fixture: ComponentFixture<ZvDialogWrapperTestComponent>;
  let rootLoader: HarnessLoader;
  let overlayContainer: OverlayContainer;
  let dialogRef: MatDialogRef<ZvDialogWrapperTestDialog>;
  let dialogWrapper: ZvDialogWrapperHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZvDialogWrapperTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ZvDialogWrapperTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    overlayContainer = TestBed.inject(OverlayContainer);

    dialogRef = component.openDialog();
    dialogWrapper = await rootLoader.getHarness(ZvDialogWrapperHarness);
  });

  afterEach(async () => {
    component.dialog.closeAll();
    overlayContainer.ngOnDestroy();
  });

  it('should show the title from its given DataSource', async () => {
    expect(await dialogWrapper.getDialogTitle()).toEqual('MyDialogTitle');
  });

  it('should call actionFunction on ok click', async () => {
    spyOn(dialogRef.componentInstance, 'actionFunction').and.callThrough();
    spyOn(dialogRef.componentInstance.dataSource, 'confirm').and.callThrough();

    const btns = await dialogWrapper.getActionButtons({ text: 'Ok' });
    expect(btns.length).toEqual(1);
    await btns[0].click();

    expect(dialogRef.componentInstance.actionFunction).toHaveBeenCalledTimes(1);
    expect(dialogRef.componentInstance.dataSource.confirm).toHaveBeenCalledTimes(1);
  });

  it('should call cancelFunction and then close on cancel click', async () => {
    const cancelSpy = spyOn(dialogRef.componentInstance, 'cancelFunction').and.callThrough();
    const closeSpy = spyOn(dialogRef.componentInstance.dataSource, 'close').and.callThrough();

    const btns = await dialogWrapper.getActionButtons({ text: 'Cancel' });
    expect(btns.length).toEqual(1);
    await btns[0].click();

    expect(cancelSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect((await rootLoader.getAllHarnesses(ZvDialogWrapperHarness)).length).toEqual(0);
  });

  it('should show errors', async () => {
    dialogRef.componentInstance.dataSource.exception = {
      errorObject: 'error 2',
    };

    dialogRef.componentInstance.dataSource.somethingChanged$.next();
    expect(await dialogWrapper.getError()).toEqual('error 2');
  });

  it('should show progress', async () => {
    expect(await dialogWrapper.getProgress()).toEqual(null);
    expect(await dialogWrapper.getProgressBar()).toEqual(null);
    dialogRef.componentInstance.dataSource.setProgress(50);

    expect(await dialogWrapper.getProgress()).toEqual('50%');
    const progressBar = await dialogWrapper.getProgressBar();
    expect(progressBar).toBeTruthy();
    expect(await progressBar.getValue()).toEqual(50);
  });
});
