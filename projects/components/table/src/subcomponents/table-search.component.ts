import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';

@Component({
  selector: 'zv-table-search',
  templateUrl: './table-search.component.html',
  styleUrls: ['./table-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatFormField, MatLabel, MatInput, MatIconButton, MatSuffix, MatIcon],
})
export class ZvTableSearchComponent implements OnInit, OnDestroy {
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
