import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { IPsException } from '@prosoft/components/core';
import { Subscription } from 'rxjs';

import { IPsViewDataSource } from './view-data-source';

@Component({
  selector: 'ps-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsViewComponent implements OnDestroy {
  @Input() public set dataSource(value: IPsViewDataSource) {
    if (this._dataSource) {
      this._dataSource.disconnect();
      this._dataSourceSub.unsubscribe();
    }

    this._dataSource = value;

    if (this._dataSource) {
      this.activateDataSource();
    }
  }
  public get dataSource(): IPsViewDataSource {
    return this._dataSource;
  }
  private _dataSource: IPsViewDataSource;

  public get contentVisible(): boolean {
    return this.dataSource.contentVisible;
  }

  public get contentBlocked(): boolean {
    return this.dataSource.contentBlocked;
  }

  public get exception(): IPsException | null {
    return this.dataSource.exception;
  }

  private _dataSourceSub = Subscription.EMPTY;

  constructor(private cd: ChangeDetectorRef) {}

  public ngOnDestroy() {
    this._dataSourceSub.unsubscribe();
    if (this._dataSource) {
      this._dataSource.disconnect();
    }
  }

  private activateDataSource() {
    if (!this._dataSource) {
      return;
    }

    this._dataSourceSub = this._dataSource.connect().subscribe(() => {
      this.cd.markForCheck();
    });
  }
}
