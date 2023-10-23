import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { IZvButton, IZvException } from '@zvoove/components/core';
import { IZvDialogWrapperDataSource } from '@zvoove/components/dialog-wrapper';
import { Observable, Subject, of } from 'rxjs';
import { ZvDialogWrapperModule } from '../../../../components/dialog-wrapper/src/dialog-wrapper.module';

interface IDemoDialogWrapperDataSourceOptions {
  dialogTitle: string;
  actionFn: () => Observable<any>;
  cancelFn: () => void;
}

export class DemoDialogWrapperDataSource implements IZvDialogWrapperDataSource {
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
  contentVisible = true;
  contentBlocked = false;
  exception: IZvException;
  progress: number | null = null;

  public somethingChanged$ = new Subject<void>();

  constructor(private options: IDemoDialogWrapperDataSourceOptions) {
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
  selector: 'app-dialog-wrapper-demo',
  template: `<button mat-raised-button color="accent" (click)="openDialog()">Open Dialog</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
})
export class DialogWrapperDemoComponent {
  constructor(public dialog: MatDialog) {}
  public openDialog() {
    this.dialog.open(DialogWrapperDemoDialog);
  }
}

@Component({
  selector: 'app-dialog-wrapper-demo',
  templateUrl: './dialog-wrapper-demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ZvDialogWrapperModule, MatButtonModule],
})
export class DialogWrapperDemoDialog {
  public actionFunctionCalled = 0;
  public dataSource = new DemoDialogWrapperDataSource({
    dialogTitle: 'My Dialog Title',
    actionFn: () => this.actionFunction(),
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
      } as IZvException;
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

  public toggleProgress() {
    this.dataSource.setProgress(this.dataSource.progress ? null : 50);
  }
}
