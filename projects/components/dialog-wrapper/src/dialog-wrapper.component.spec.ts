import { OverlayContainer } from '@angular/cdk/overlay';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IPsButton, IPsException } from '@prosoft/components/core';
import { Observable, of, Subject } from 'rxjs';
import { IPsDialogWrapperDataSource } from './dialog-wrapper.models';
import { PsDialogWrapperModule } from './dialog-wrapper.module';
import { PsDialogWrapperHarness } from './testing/dialog-wrapper.harness';

interface ITestDialogWrapperDataSourceOptions {
  dialogTitle: string;
  actionFn: () => Observable<any>;
  cancelFn: () => void;
}

export class TestDialogWrapperDataSource implements IPsDialogWrapperDataSource {
  dialogTitle = this.options.dialogTitle;
  buttons: IPsButton[] = [
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
  exception: IPsException;

  public somethingChanged$ = new Subject<void>();

  constructor(private options: ITestDialogWrapperDataSourceOptions) {}

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
}

@Component({
  selector: 'ps-dialog-wrapper-dialog',
  template: `
    <ps-dialog-wrapper [dataSource]="dataSource">
      <span>dialogContent</span>
    </ps-dialog-wrapper>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsDialogWrapperTestDialog {
  dataSource = new TestDialogWrapperDataSource({
    dialogTitle: 'MyDialogTitle',
    actionFn: () => this.actionFunction(),
    cancelFn: () => this.cancelFunction(),
  });

  private _cancelFunctionCalled: number;

  constructor(public dialogRef: MatDialogRef<PsDialogWrapperTestDialog>) {}

  public actionFunction() {
    return of();
  }

  public cancelFunction() {
    this._cancelFunctionCalled = this._cancelFunctionCalled + 1;
    this.dialogRef.close();
  }
}

@Component({
  selector: 'ps-dialog-wrapper-test',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsDialogWrapperTestComponent {
  constructor(public dialog: MatDialog) {}

  public openDialog() {
    return this.dialog.open(PsDialogWrapperTestDialog);
  }
}

describe('DialogUnitTestComponent', () => {
  let component: PsDialogWrapperTestComponent;
  let fixture: ComponentFixture<PsDialogWrapperTestComponent>;
  let rootLoader: HarnessLoader;
  let overlayContainer: OverlayContainer;
  let dialogRef: MatDialogRef<PsDialogWrapperTestDialog>;
  let dialogWrapper: PsDialogWrapperHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, MatDialogModule, PsDialogWrapperModule],
      declarations: [PsDialogWrapperTestDialog, PsDialogWrapperTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PsDialogWrapperTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    overlayContainer = TestBed.inject(OverlayContainer);

    dialogRef = component.openDialog();
    dialogWrapper = await rootLoader.getHarness(PsDialogWrapperHarness);
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
    expect((await rootLoader.getAllHarnesses(PsDialogWrapperHarness)).length).toEqual(0);
  });

  it('should show errors', async () => {
    dialogRef.componentInstance.dataSource.exception = {
      errorObject: 'error 2',
    };

    dialogRef.componentInstance.dataSource.somethingChanged$.next();
    expect(await dialogWrapper.getError()).toEqual('error 2');
  });
});
