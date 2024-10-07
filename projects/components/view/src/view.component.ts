import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { IZvException, ZvErrorMessagePipe } from '@zvoove/components/core';
import { Subscription } from 'rxjs';
import { IZvViewDataSource } from './view-data-source';

@Component({
  selector: 'zv-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [ZvBlockUi, MatCard, MatIcon, ZvErrorMessagePipe],
})
export class ZvView implements OnDestroy {
  @Input({ required: true }) public set dataSource(value: IZvViewDataSource) {
    if (this._dataSource) {
      this._dataSource.disconnect();
      this._dataSourceSub.unsubscribe();
    }

    this._dataSource = value;

    if (this._dataSource) {
      this.activateDataSource();
    }
  }
  public get dataSource(): IZvViewDataSource {
    return this._dataSource;
  }
  private _dataSource: IZvViewDataSource;

  public get contentVisible(): boolean {
    return this.dataSource.contentVisible;
  }

  public get contentBlocked(): boolean {
    return this.dataSource.contentBlocked;
  }

  public get exception(): IZvException | null {
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
