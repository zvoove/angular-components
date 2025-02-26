import { ChangeDetectionStrategy, Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { ZvErrorMessagePipe } from '@zvoove/components/core';
import { IZvViewDataSource } from './view-data-source';

@Component({
  selector: 'zv-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ZvBlockUi, MatCard, MatIcon, ZvErrorMessagePipe],
})
export class ZvView implements OnDestroy {
  @Input({ required: true }) public set dataSource(value: IZvViewDataSource) {
    if (this._dataSource) {
      this._dataSource.disconnect();
    }

    this._dataSource = value;

    if (this._dataSource) {
      this.activateDataSource();
    }
  }
  public get dataSource(): IZvViewDataSource {
    return this._dataSource;
  }
  private _dataSource!: IZvViewDataSource;

  public ngOnDestroy() {
    if (this._dataSource) {
      this._dataSource.disconnect();
    }
  }

  private activateDataSource() {
    if (!this._dataSource) {
      return;
    }
    this._dataSource.connect();
  }
}
