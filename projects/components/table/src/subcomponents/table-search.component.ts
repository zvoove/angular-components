import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { IZvTableIntlTexts } from '@zvoove/components/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'zv-table-search',
  templateUrl: './table-search.component.html',
  styleUrls: ['./table-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZvTableSearchComponent implements OnInit, OnDestroy {
  @Input() public intl: IZvTableIntlTexts;
  @Input() public searchText: string;
  @Input() public debounceTime: number;
  @Output() public readonly searchChanged = new EventEmitter<string>();

  public currentSearchText = '';

  private _searchValueChanged$ = new Subject<void>();

  public ngOnInit() {
    this.currentSearchText = this.searchText;
    this._searchValueChanged$.pipe(debounceTime(this.debounceTime)).subscribe(() => {
      this.emitChange();
    });
  }

  public onSearch(key: string, value: string) {
    if (key.startsWith('Esc')) {
      this.searchText = '';
      this.emitChange();
      return;
    }

    this.searchText = value;
    this._searchValueChanged$.next();
  }

  public ngOnDestroy() {
    this._searchValueChanged$.complete();
  }

  private emitChange() {
    if (this.currentSearchText !== this.searchText) {
      this.currentSearchText = this.searchText;
      this.searchChanged.emit(this.currentSearchText);
    }
  }
}
