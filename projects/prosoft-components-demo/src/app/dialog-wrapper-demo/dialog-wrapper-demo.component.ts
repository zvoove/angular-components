import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IPsButton, IPsException } from '@prosoft/components/core';
import { IPsDialogWrapperDataSource } from '@prosoft/components/dialog-wrapper';
import { Observable, of, Subject } from 'rxjs';

interface IDemoDialogWrapperDataSourceOptions {
  dialogTitle: string;
  actionFn: () => Observable<any>;
  cancelFn: () => void;
}

export class DemoDialogWrapperDataSource implements IPsDialogWrapperDataSource {
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
  contentVisible = true;
  contentBlocked = false;
  exception: IPsException;

  public somethingChanged$ = new Subject<void>();

  constructor(private options: IDemoDialogWrapperDataSourceOptions) {}

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
  selector: 'app-dialog-wrapper-demo',
  template: ` <button mat-raised-button color="accent" (click)="openDialog()">Open Dialog</button> `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogWrapperDemoComponent {
  constructor(public dialog: MatDialog) {}
  public openDialog() {
    this.dialog.open(DialogWrapperDemoDialog);
  }
}

@Component({
  selector: 'app-dialog-wrapper-demo',
  template: `
    <ps-dialog-wrapper [dataSource]="dataSource">
      <div style="margin: 1em;">
        <div>Action function called: {{ actionFunctionCalled }}</div>
        <button type="button" mat-button (click)="toggleError()">Create error</button>
        <button type="button" mat-stroked-button (click)="block()">Block for 2 seconds</button>
      </div>
    </ps-dialog-wrapper>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogWrapperDemoDialog {
  public actionFunctionCalled = 0;
  public dataSource = new DemoDialogWrapperDataSource({
    actionFn: () => this.actionFunction(),
    dialogTitle: 'My Dialog Title',
    cancelFn: () => this.cancelFunction(),
  });

  constructor(public dialogRef: MatDialogRef<DialogWrapperDemoDialog>) {}

  public actionFunction() {
    this.actionFunctionCalled = this.actionFunctionCalled + 1;
    return of(null);
  }

  public cancelFunction() {
    this.dialogRef.close();
  }

  public toggleError() {
    if (!this.dataSource.exception) {
      this.dataSource.exception = {
        errorObject: { message: 'I am an evil error' },
      } as IPsException;
    } else {
      this.dataSource.exception = null;
    }

    this.dataSource.somethingChanged$.next();
  }

  public block() {
    this.dataSource.contentBlocked = true;
    this.dataSource.somethingChanged$.next();
    setTimeout(() => {
      this.dataSource.contentBlocked = false;
      this.dataSource.somethingChanged$.next();
    }, 2000);
  }
}
