import { CdkScrollable } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { ZvButton } from '@zvoove/components/button';
import { IZvButton, IZvException, ZvErrorMessagePipe } from '@zvoove/components/core';
import { Subscription } from 'rxjs';
import { IZvDialogWrapperDataSource } from './dialog-wrapper.models';

@Component({
  selector: 'zv-dialog-wrapper',
  templateUrl: './dialog-wrapper.component.html',
  styleUrls: ['./dialog-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, ZvBlockUi, MatDialogActions, MatProgressBar, ZvButton, ZvErrorMessagePipe],
})
export class ZvDialogWrapper implements OnDestroy {
  public get dialogTitle(): string | null {
    return this.dataSource.dialogTitle;
  }
  public get buttons(): IZvButton[] {
    return this.dataSource.buttons;
  }
  public get contentVisible(): boolean {
    return this.dataSource.contentVisible;
  }
  public get contentBlocked(): boolean {
    return this.dataSource.contentBlocked;
  }
  public get exception(): IZvException | null {
    return this.dataSource.exception;
  }
  public get progress(): number | null | undefined {
    return this.dataSource.progress;
  }
  public get showProgress(): boolean {
    return this.progress != null && this.progress >= 0;
  }
  @Input({ required: true }) public set dataSource(value: IZvDialogWrapperDataSource) {
    if (this._dataSource) {
      this._dataSource.disconnect();
      this._dataSourceSubscription.unsubscribe();
    }

    this._dataSource = value;

    if (this._dataSource) {
      this._dataSourceSubscription = this._dataSource.connect().subscribe(() => {
        this.cd.markForCheck();
      });
    }
  }
  public get dataSource(): IZvDialogWrapperDataSource {
    return this._dataSource;
  }
  private _dataSource!: IZvDialogWrapperDataSource;

  private _dataSourceSubscription = Subscription.EMPTY;
  constructor(private cd: ChangeDetectorRef) {}

  public ngOnDestroy() {
    this._dataSourceSubscription.unsubscribe();
    if (this._dataSource) {
      this._dataSource.disconnect();
    }
  }
}
