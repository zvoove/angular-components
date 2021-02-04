import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { IPsButton, IPsException } from '@prosoft/components/core';
import { Subject, Subscription } from 'rxjs';
import { IPsDialogWrapperDataSource } from './dialog-wrapper.models';

@Component({
  selector: 'ps-dialog-wrapper',
  templateUrl: 'dialog-wrapper.component.html',
  styleUrls: ['dialog-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsDialogWrapperComponent implements OnDestroy {
  public get dialogTitle(): string {
    return this.dataSource.dialogTitle;
  }
  public get buttons(): IPsButton[] {
    return this.dataSource.buttons;
  }
  public get contentVisible(): boolean {
    return this.dataSource.contentVisible;
  }
  public get contentBlocked(): boolean {
    return this.dataSource.contentBlocked;
  }
  public get exception(): IPsException | null {
    return this.dataSource.exception;
  }
  @Input() public set dataSource(value: IPsDialogWrapperDataSource) {
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
  public get dataSource(): IPsDialogWrapperDataSource {
    return this._dataSource;
  }
  private _dataSource: IPsDialogWrapperDataSource;

  private _dataSourceSubscription = Subscription.EMPTY;
  private _ngUnsubscribe$ = new Subject<void>();
  constructor(private cd: ChangeDetectorRef) {}

  public ngOnDestroy() {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();

    this._dataSourceSubscription.unsubscribe();
    if (this._dataSource) {
      this._dataSource.disconnect();
    }
  }
}
